const Delivery = require('../Schema/deliveries');
const mongoose = require('mongoose');
const COD = require('../Schema/cod');
const sendSMS = require('../Utils/sendSMS');
const User = require('../Schema/user'); // 📱 Fetch driver number here


// ✅ Create Delivery
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

// ✅ Get All Deliveries
const getAllDeliveries = async (req, res) => {
  try {
    const { from, to } = req.query;
    const filter = {};

    if (from && to) {
      const start = new Date(from);
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      filter.deliveryDate = { $gte: start, $lte: end };
    } else {
      const today = new Date();
      const start = new Date(today.setHours(0, 0, 0, 0));
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      filter.deliveryDate = { $gte: start, $lte: end };
    }

    const deliveries = await Delivery.find(filter)
      .populate('driver', '_id name phoneNumber')
      .populate('salesperson', 'name phoneNumber')
      .sort({ deliveryDate: -1 });

    res.json(deliveries);
  } catch (err) {
    console.error('❌ Error fetching deliveries:', err);
    res.status(500).json({ message: 'Failed to fetch deliveries' });
  }
};

// ✅ Update Delivery Status (Drivers/Managers)
const updateDelivery = async (req, res) => {
  try {
    const deliveryId = req.params.id;
    const userId = req.session?.user?.id;
    const userRole = req.session?.user?.role;

    if (!userId || !userRole) {
      return res.status(401).json({ message: 'Unauthorized - Missing user context' });
    }

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });

    // ❌ If user is a driver and NOT assigned to this delivery, reject
    if (userRole === 'Driver' && delivery.driver?.toString() !== userId) {
      return res.status(403).json({ message: 'Drivers can only update their assigned deliveries' });
    }

    // ✅ Managers can assign themselves if no driver is set
    if (userRole === 'Management' && !delivery.driver) {
      delivery.driver = userId;
    }

    // ✅ Now update the status
    const prevStatus = delivery.status;
    delivery.status = req.body.status;
    await delivery.save();

    // ✅ If status is 'Delivered' → redirect to COD creation (if not already exists)
    if (req.body.status === 'Delivered' && prevStatus !== 'Delivered') {
      const codExists = await COD.findOne({ delivery: delivery._id });
      if (!codExists) {
        return res.status(200).json({
          message: 'Redirect to COD creation',
          redirect: `/driver/cod/from-delivery/${delivery._id}`
        });
      }
    }

    res.status(200).json({ message: 'Status updated', delivery });
  } catch (err) {
    console.error('❌ Error updating delivery:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};



const editDeliveryDetails = async (req, res) => {
  try {
    const deliveryId = req.params.id;

    const updatedDelivery = await Delivery.findByIdAndUpdate(
      deliveryId,
      req.body,
      { new: true }
    ).populate('driver'); // 👈 Ensure driver info is available

    if (!updatedDelivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    // ✅ Send SMS if driver is assigned and has a phone number
    if (updatedDelivery.driver?.phoneNumber) {
      console.log(' Driver phone:', updatedDelivery.driver.phoneNumber);
      console.log(' Sending SMS for:', updatedDelivery.customerName);

    await sendSMS(
      updatedDelivery.driver.phoneNumber,
      `DriveFast: Delivery for ${updatedDelivery.customerName} updated. New address: ${updatedDelivery.address || 'N/A'}. Delivery at ${new Date(updatedDelivery.deliveryDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Reply STOP to opt out.`
    );

    }

    res.status(200).json(updatedDelivery);
  } catch (err) {
    console.error(' Error updating delivery:', err);
    res.status(500).json({ message: 'Server error' });
  }
};



// ✅ Delete Delivery
const deleteDelivery = async (req, res) => {
  try {
    const deleted = await Delivery.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Delivery not found' });
    res.status(200).json({ message: 'Delivery deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting delivery', error: err.message });
  }
};

// ✅ Assign Driver
const assignDriver = async (req, res) => {
  const { id } = req.params;
  const { driverId } = req.body;

  if (!driverId) return res.status(400).json({ message: 'Driver ID is required' });
  if (!mongoose.Types.ObjectId.isValid(driverId)) return res.status(400).json({ message: 'Invalid driver ID format' });

  try {
    const updated = await Delivery.findByIdAndUpdate(
      id,
      { driver: new mongoose.Types.ObjectId(driverId) },
      { new: true }
    ).populate('driver', '_id name');

    if (!updated) return res.status(404).json({ message: 'Delivery not found' });
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
  editDeliveryDetails,
  deleteDelivery,
  assignDriver
};
