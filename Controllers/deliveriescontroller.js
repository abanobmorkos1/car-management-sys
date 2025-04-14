const Delivery = require('../Schema/deliveries');

const createDelivery = async (req, res) => {
    try {
      const {
        customerName, phoneNumber, address, salesperson,
        deliveryDate, codAmount, notes
      } = req.body;
  
      const newDelivery = new Delivery({
        customerName,
        phoneNumber,
        address,
        salesperson,
        deliveryDate,
        codAmount,
        notes
      });
  
      const saved = await newDelivery.save();
      res.status(201).json(saved);
    } catch (err) {
      res.status(500).json({ message: 'Error creating delivery', error: err.message });
    }
  };
  
  // Get all deliveries
  const getAllDeliveries = async (req, res) => {
    try {
      const deliveries = await Delivery.find().sort({ createdAt: -1 });
      res.status(200).json(deliveries);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching deliveries', error: err.message });
    }
  };

  
    // Update a delivery by ID
    const updateDelivery = async (req, res) => {
        try {
          const updated = await Delivery.findByIdAndUpdate(req.params.id, req.body, { new: true });
      
          if (!updated) return res.status(404).json({ message: 'Delivery not found' });
      
          res.status(200).json(updated);
        } catch (err) {
          res.status(500).json({ message: 'Error updating delivery', error: err.message });
        }
      };

// Delete a delivery by ID
const deleteDelivery = async (req, res) => {
    try {
      const deleted = await Delivery.findByIdAndDelete(req.params.id);
  
      if (!deleted) return res.status(404).json({ message: 'Delivery not found' });
  
      res.status(200).json({ message: 'Delivery deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error deleting delivery', error: err.message });
    }
  };
  
module.exports = 
{    createDelivery,
    getAllDeliveries,
    updateDelivery,
    deleteDelivery};