const COD = require('../Schema/cod');
const { verifyToken } = require('../Middleware/auth');


const createCOD = async (req, res) => {
  try {
    const {
      customerName, phoneNumber, address, amount, method,
      salesperson, car, driver, contractKey, checkKey
    } = req.body;

    if (method === 'Check' && !checkKey) {
      return res.status(400).json({ message: 'Check picture is required for Check payments' });
    }

    const newCOD = new COD({
      customerName,
      phoneNumber,
      address,
      amount,
      method,
      contractKey,
      checkKey: method === 'Check' ? checkKey : null,
      salesperson,
      car,
      driver
    });

    const saved = await newCOD.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('🔥 Error inside createCOD:', err);
    res.status(500).json({ message: 'Error saving COD', error: err.message });
  }
};

// Delete COD by ID
const deleteCOD = async (req, res) => {
  try {
    const deleted = await COD.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'COD entry not found' });
    }
    res.status(200).json({ message: 'COD entry deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting COD', error: err.message });
  }
};

// Update COD by ID
const updateCOD = async (req, res) => {
  try {
    const updated = await COD.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'COD entry not found' });
    }
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating COD', error: err.message });
  }
};

const getAllCOD = async (req, res) => {
  try {
    const cods = await COD.find()
      .populate('salesperson', 'name phoneNumber email')
      .populate('driver', 'name phoneNumber')
      .sort({ createdAt: -1 });
    res.status(200).json(cods);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch CODs', error: err.message });
  }
};


// Search CODs by customer name (partial + case-insensitive)
const searchCODByCustomer = async (req, res) => {
  try {
    const name = req.params.name;
    const regex = new RegExp(name, 'i'); // case-insensitive search
    const results = await COD.find({ customerName: regex });

    if (results.length === 0) {
      return res.status(404).json({ message: 'No COD entries found for this customer' });
    }

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ message: 'Error searching CODs', error: err.message });
  }
};

module.exports = {
  createCOD,
  deleteCOD,
  updateCOD,  
  getAllCOD,
  searchCODByCustomer
};