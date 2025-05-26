const express = require('express');
const { verifyToken } = require('../Middleware/auth'); // Import your auth middleware

const {
  createDelivery,
  getAllDeliveries,
  updateDelivery,
  deleteDelivery,
  assignDriver
} = require('../Controllers/deliveriescontroller');

const router = express.Router();
router.put('/assign-driver/:id', verifyToken, assignDriver);
router.post('/', verifyToken ,createDelivery);             // Create
router.get('/deliveries',verifyToken, getAllDeliveries);          // Read all
router.put('/status/:id', verifyToken, updateDelivery); // Edit
// router.delete('/delivery/:id',verifyToken, deleteDelivery);       // Delete

module.exports = router;
