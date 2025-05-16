const express = require('express');
const router = express.Router();
const { verifyToken } = require('../Middleware/auth'); // Import your auth middleware

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

// Delete COD
router.delete('/delete/:id', deleteCOD);

// Update COD
router.put('/update/:id', updateCOD);

// Get all CODs
router.get('/all', getAllCOD);

// Search CODs by customer name
router.get('/search/:name', searchCODByCustomer);
module.exports = router;
