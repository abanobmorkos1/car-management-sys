const Delivery = require('../Schema/deliveries');
const mongoose = require('mongoose');
const COD = require('../Schema/cod'); // Assuming you have a COD model
const createDelivery = async (req, res) => {
  try {
        if (req.session?.user?.role === 'Sales') {
      req.body.salesperson = req.session.user.id;
    }
    const delivery = new Delivery(req.body);
    await delivery.save();
    res.status(201).json(delivery);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error saving delivery', error: err.message });
  }
};

const getAllDeliveries = async (req, res) => {
  try {
    const { from, to } = req.query;
    const filter = {};

    console.log("📥 Incoming query:", { from, to });
    
    if (req.session?.user?.role === 'Driver') {
      filter.$or = [
        { driver: null },
        { driver: req.session.user.id }
      ];
    }
    // 🔒 Sales: show only their deliveries
      if (req.session?.user?.role === 'Sales') {
        filter.salesperson = req.session.user.id;
      }
    // 📆 Optional date filtering
    if (from && to) {
      const start = new Date(from);
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      filter.deliveryDate = { $gte: start, $lte: end };
      console.log("📅 Final delivery date filter:", filter.deliveryDate);
    } else {
      const today = new Date();
      const start = new Date(today.setHours(0, 0, 0, 0));
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      filter.deliveryDate = { $gte: start, $lte: end };
      console.log("📅 Defaulting to today's date range:", filter.deliveryDate);
    }

    const deliveries = await Delivery.find(filter)
      .populate('driver', '_id name')
      .populate('salesperson', 'name')
      .sort({ deliveryDate: -1 });

    console.log("📦 Deliveries fetched:", deliveries.length);
    deliveries.forEach(d => {
      console.log('🗓️ Delivery:', d.customerName, '-', d.deliveryDate);
    });

    res.json(deliveries);
  } catch (err) {
    console.error('❌ Error fetching deliveries:', err);
    res.status(500).json({ message: 'Failed to fetch deliveries' });
  }
};


const updateDelivery = async (req, res) => {
  try {
    console.log('📥 updateDelivery called for ID:', req.params.id);

    const deliveryId = req.params.id;
    const userId = req.session?.user?.id;
    const userRole = req.session?.user?.role;

    const delivery = await Delivery.findById(deliveryId);

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    if (userRole !== 'Driver' || delivery.driver?.toString() !== userId) {
      return res.status(403).json({ message: 'Only the assigned driver can update delivery status' });
    }

    console.log('📝 Status change:', {
      previous: delivery.status,
      new: req.body.status
    });

    const prevStatus = delivery.status;
    delivery.status = req.body.status;
    await delivery.save();

    if (req.body.status === 'Delivered' && prevStatus !== 'Delivered') {
      const codExists = await COD.findOne({ delivery: delivery._id });
      console.log('🔍 Existing COD found:', !!codExists);

      if (!codExists) {
        console.log('📤 Creating COD with:', {
          delivery: delivery._id,
          customerName: delivery.customerName,
          phoneNumber: delivery.phoneNumber,
          address: delivery.address,
          amount: delivery.codAmount,
          salesperson: delivery.salesperson,
          driver: delivery.driver,
          car: {
            make: delivery.make,
            model: delivery.model,
            trim: delivery.trim,
            color: delivery.color,
            year: delivery.year
          }
        });

        await COD.create({
          delivery: delivery._id,
          customerName: delivery.customerName,
          phoneNumber: delivery.phoneNumber,
          address: delivery.address,
          amount: delivery.codAmount || 0,
          method: 'None',
          contractPicture: '',
          checkPicture: '',
          salesperson: delivery.salesperson,
          driver: delivery.driver,
          car: {
            year: delivery.year,
            make: delivery.make,
            model: delivery.model,
            trim: delivery.trim,
            color: delivery.color
          },
          createdFromDelivery: true
        });

        console.log('✅ COD created successfully.');
      }
    }

    res.status(200).json({ message: 'Status updated', delivery });

  } catch (err) {
    console.error('❌ Error updating delivery:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteDelivery = async (req, res) => {
  try {
    const deleted = await Delivery.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ message: 'Delivery not found' });

    res.status(200).json({ message: 'Delivery deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting delivery', error: err.message });
  }
};

const assignDriver = async (req, res) => {
  const { id } = req.params;
  const { driverId } = req.body;



  if (!driverId) {
    return res.status(400).json({ message: 'Driver ID is required' });
  }

  if (!mongoose.Types.ObjectId.isValid(driverId)) {
    return res.status(400).json({ message: 'Invalid driver ID format' });
  }

  try {
    const updated = await Delivery.findByIdAndUpdate(
      id,
      { driver: new mongoose.Types.ObjectId(driverId) }, // ✅ fixed
      { new: true }
    ).populate('driver', '_id name'); // ✅ ensure _id is included

    if (!updated) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    res.status(200).json({ message: 'Driver assigned successfully', delivery: updated });
  } catch (err) {
    console.error('❌ Error during driver assignment:', err);
    res.status(500).json({ message: 'Failed to assign driver', error: err.message });
  }
};


module.exports = {
  createDelivery,
  getAllDeliveries,
  updateDelivery,
  deleteDelivery,
  assignDriver
};
