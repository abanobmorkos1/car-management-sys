const express = require('express');
const { verifyToken } = require('../Middleware/auth'); // Import your auth middleware

const {
  createDelivery,
  getAllDeliveries,
  updateDelivery,
  deleteDelivery
} = require('../Controllers/deliveriescontroller');

const router = express.Router();

router.post('/', verifyToken ,createDelivery);             // Create
router.get('/deliveries',verifyToken, getAllDeliveries);          // Read all
router.put('/delivery/:id',verifyToken, updateDelivery);          // Edit
router.delete('/delivery/:id',verifyToken, deleteDelivery);       // Delete

module.exports = router;
