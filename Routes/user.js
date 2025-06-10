const express = require('express');
const router = express.Router();
const User = require('../Schema/user');
const { verifyToken } = require('../Middleware/auth');

// Get all Salespeople
router.get('/salespeople', verifyToken, async (req, res) => {
  try {
    const salespeople = await User.find({ role: 'Sales' }).select('name phoneNumber email');
    res.status(200).json(salespeople);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch salespeople', error: err.message });
  }
});

// Get all Drivers
router.get('/drivers', verifyToken, async (req, res) => {
  try {
    const drivers = await User.find({ role: 'Driver' }).select('name phoneNumber email');
    res.status(200).json(drivers);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch drivers', error: err.message });
  }
});



module.exports = router;
