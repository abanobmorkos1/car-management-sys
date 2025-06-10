const express = require('express');
const router = express.Router();

// Route to dynamically add salespeople
router.post('/salesperson', async (req, res) => {
  const { name, email, role } = req.body;

  try {
    const newSalesperson = new Salesperson({ name, email, role });
    await newSalesperson.save();
    res.status(201).json(newSalesperson);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create salesperson' });
  }
});

module.exports = router;
