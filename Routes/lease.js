const express = require('express');
const Delivery = require('../Schema/deliveries');
const COD = require('../Schema/cod');
const {
  addLr,
  getAlllr,
  deleteLr,
  updateLr,
  getLeaseByVin,
  setLeaseReturnStatus,
  updateGroundingStatus,
} = require('../Controllers/leasecontroller');

const {
  createDisclosure,
  updateDisclosure,
  getDisclosures,
  getDisclosureById,
  deleteDisclosure,
} = require('../Controllers/odometerDisclosureController');

const router = express.Router();
const { verifyToken, requireRole } = require('../Middleware/auth');

// Add a lease return
router.post('/createlr', verifyToken, addLr);

// Get all lease returns
router.get('/getlr', getAlllr);

// Delete a lease by ID
router.delete('/deleteLr/:id', deleteLr);

// Update a lease by ID
router.put('/updateLr/:id', updateLr);

// Search by VIN
router.get('/by-vin/:vin', getLeaseByVin);
router.put(
  '/set-status/:id',
  verifyToken,
  requireRole('Sales', 'Owner'),
  setLeaseReturnStatus
);

// Allow only Sales, Management, or Owner to set grounding
router.put('/grounding-status/:id', verifyToken, updateGroundingStatus);

router.post('/odometer-disclosure', verifyToken, createDisclosure);
router.get('/odometer-disclosure', verifyToken, getDisclosures);
router.get('/odometer-disclosure/:id', verifyToken, getDisclosureById);
router.put('/odometer-disclosure/:id', verifyToken, updateDisclosure);
router.delete(
  '/odometer-disclosure/:id',
  verifyToken,
  requireRole('Management', 'Owner'),
  deleteDisclosure
);

module.exports = router;
