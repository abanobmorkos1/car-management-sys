const express = require('express');
const { verifyToken } = require('../Middleware/auth'); // Import your auth middleware
const {
  createDelivery,
  getAllDeliveries,
  updateDelivery,
  deleteDelivery,
  assignDriver,
  editDeliveryDetails
} = require('../Controllers/deliveriescontroller');
const Delivery = require('../Schema/deliveries')
const COD = require('../Schema/cod');

const router = express.Router();
router.put('/assign-driver/:id', verifyToken, assignDriver);
router.post('/', verifyToken ,createDelivery);             // Create
router.get('/deliveries',verifyToken, getAllDeliveries);          // Read all
router.put('/update-status/:id', verifyToken, updateDelivery);
router.put('/edit/:id', verifyToken, editDeliveryDetails); // sales edit form

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
router.put('/cod-info/:id', verifyToken, async (req, res) => {
  try {
    const { codCollected, codMethod } = req.body;
    const updated = await Delivery.findByIdAndUpdate(
      req.params.id,
      { codCollected, codMethod },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error('❌ Error updating COD info on delivery:', err);
    res.status(500).json({ message: 'Failed to update delivery COD info' });
  }
});
module.exports = router;
