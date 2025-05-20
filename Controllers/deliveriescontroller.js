const Delivery = require('../Schema/deliveries');
const mongoose = require('mongoose');
const createDelivery = async (req, res) => {
try {
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
    const deliveries = await Delivery.find()
      .sort({ createdAt: -1 })
      .populate({ path: 'driver', select: 'name email', strictPopulate: false }); // ✅ Fix: populate driver details

    res.status(200).json(deliveries);
  } catch (err) {
    console.error('❌ getAllDeliveries error:', err);
    res.status(500).json({ message: 'Error fetching deliveries', error: err.message });
  }
};

const updateDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);

    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });

    // Check if the user is a driver and NOT assigned to this delivery
    if (req.user.role === 'Driver') {
      if (!delivery.driver || delivery.driver.toString() !== req.user.id) {
        return res.status(403).json({ message: 'You are not assigned to this delivery' });
      }
    }

    const updated = await Delivery.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating delivery', error: err.message });
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

  console.log('📦 Assigning delivery ID:', id);
  console.log('🚚 Driver ID received:', driverId);

  if (!driverId) {
    return res.status(400).json({ message: 'Driver ID is required' });
  }

  if (!mongoose.Types.ObjectId.isValid(driverId)) {
    return res.status(400).json({ message: 'Invalid driver ID format' });
  }

  try {
    const updated = await Delivery.findByIdAndUpdate(
      id,
      { driver: driverId },
      { new: true }
    ).populate('driver', 'name');

    if (!updated) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    res.status(200).json({ message: 'Driver assigned successfully', delivery: updated });
  } catch (err) {
    console.error('❌ Error during driver assignment:', err);
    res.status(500).json({ message: 'Failed to assign driver', error: err.message });
  }
}
module.exports = {
  createDelivery,
  getAllDeliveries,
  updateDelivery,
  deleteDelivery,
  assignDriver
};
