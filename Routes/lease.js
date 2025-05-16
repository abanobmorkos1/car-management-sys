const express = require('express');
const {
  addLr,
  getAlllr,
  deleteLr,
  updateLr,
  getLeaseByVin
} = require('../Controllers/leasecontroller');
const router = express.Router();
const { verifyToken } = require('../Middleware/auth');

// Add a lease return
router.post(
  '/createlr',
  verifyToken,
  addLr
);

// Get all lease returns
router.get('/getlr', getAlllr);

// Delete a lease by ID
router.delete('/deleteLr/:id', deleteLr);

// Update a lease by ID
router.put('/updateLr/:id', updateLr);

// Search by VIN
router.get('/by-vin/:vin', getLeaseByVin);

module.exports = router;
