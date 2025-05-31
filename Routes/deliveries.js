const express = require('express');
const { verifyToken } = require('../Middleware/auth'); // Import your auth middleware
const {
  createDelivery,
  getAllDeliveries,
  updateDelivery,
  deleteDelivery,
  assignDriver
} = require('../Controllers/deliveriescontroller');
const Delivery = require('../Schema/deliveries')

const router = express.Router();
router.put('/assign-driver/:id', verifyToken, assignDriver);
router.post('/', verifyToken ,createDelivery);             // Create
router.get('/deliveries',verifyToken, getAllDeliveries);          // Read all
router.put('/status/:id', verifyToken, updateDelivery); // Edit
// router.delete('/delivery/:id',verifyToken, deleteDelivery);       // Delete
router.get('/:id', async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id)
      .populate('salesperson', 'name _id')
      .populate('driver', 'name _id');

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    res.json(delivery);
  } catch (err) {
    console.error('❌ Error fetching delivery by ID:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/by-delivery/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cod = await COD.findOne({ delivery: id }); // 🔍 looks by delivery ID
    if (!cod) return res.status(404).json({ message: 'COD not found for this delivery' });

    res.json(cod);
  } catch (err) {
    console.error('❌ Error fetching COD:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
