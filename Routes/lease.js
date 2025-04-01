const express = require('express');
const { addCar, getAllCars } = require('../Controllers/leasecontroller');

const router = express.Router();

// Add a lease return
router.post('/createlr', addCar);

// Get all lease returns
router.get('/Leasereturns', getAllCars);

module.exports = router;
