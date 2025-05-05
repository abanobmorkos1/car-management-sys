const express = require('express');
const {
  createDelivery,
  getAllDeliveries,
  updateDelivery,
  deleteDelivery
} = require('../Controllers/deliveriescontroller');

const router = express.Router();

router.post('/new', createDelivery);             // Create
router.get('/deliveries', getAllDeliveries);          // Read all
router.put('/delivery/:id', updateDelivery);          // Edit
router.delete('/delivery/:id', deleteDelivery);       // Delete

module.exports = router;
