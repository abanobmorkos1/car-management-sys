const express = require('express');
const {
  addLr,
  getAlllr,
  deleteLr,
  updateLr,
  getLeaseByVin,
  setLeaseReturnStatus,
  updateGroundingStatus
} = require('../Controllers/leasecontroller');
const router = express.Router();
const { verifyToken ,requireRole } = require('../Middleware/auth');

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
router.put('/set-status/:id', verifyToken, requireRole('Sales', 'Owner'), setLeaseReturnStatus);

// Allow only Sales, Management, or Owner to set grounding
router.put('/grounding-status/:id', verifyToken, requireRole('Sales', 'Management', 'Owner', 'Driver'), updateGroundingStatus);



module.exports = router;
