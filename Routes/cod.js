const express = require('express');
const router = express.Router();
const { verifyToken } = require('../Middleware/auth'); // Import your auth middleware
const COD = require('../Schema/cod'); // Import your COD model
const {
  createCOD,
  deleteCOD,
  updateCOD,
  getAllCOD,
  searchCODByCustomer
} = require('../Controllers/codcontroller');

router.post(
  '/newcod',
  verifyToken,
  createCOD
);

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


// Delete COD
router.delete('/delete/:id', deleteCOD);

// Update COD
router.put('/update/:id', updateCOD);

// Get all CODs
router.get('/all', getAllCOD);

// Search CODs by customer name
router.get('/search/:name', searchCODByCustomer);

module.exports = router;
