const Delivery = require('../Schema/deliveries');

const createDelivery = async (req, res) => {
  
  console.log('📥 Incoming Delivery Data:', req.body);
  try {
    const {
      customerName, phoneNumber, address, pickupFrom,
      salesperson, deliveryDate, codAmount, codCollected,
      codMethod, codCollectionDate, notes,
      vin, make, model, trim, color
    } = req.body;

    const codAmountParsed = Number(codAmount);
      if (isNaN(codAmountParsed)) {
        return res.status(400).json({ message: 'COD amount must be a number' });
    }

    const newDelivery = new Delivery({
      customerName,
      phoneNumber,
      address,
      pickupFrom, // ✅ NEW FIELD
      salesperson,
      deliveryDate,
      codAmount: codAmountParsed,
      codCollected,
      codMethod,
      codCollectionDate,
      notes,
      vin,
      make,
      model,
      trim,
      color
    });

    const saved = await newDelivery.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Error creating delivery', error: err.message });
  }
};

// ✅ Get all deliveries, populated with names
const getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find()
      .populate('salesperson', 'name') // populate name field only
      .populate('driver', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(deliveries);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching deliveries', error: err.message });
  }
};

// ✅ Update a delivery by ID
const updateDelivery = async (req, res) => {
  try {
    const updated = await Delivery.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updated) return res.status(404).json({ message: 'Delivery not found' });

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating delivery', error: err.message });
  }
};

// ✅ Delete a delivery by ID
const deleteDelivery = async (req, res) => {
  try {
    const deleted = await Delivery.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ message: 'Delivery not found' });

    res.status(200).json({ message: 'Delivery deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting delivery', error: err.message });
  }
};

module.exports = {
  createDelivery,
  getAllDeliveries,
  updateDelivery,
  deleteDelivery
};