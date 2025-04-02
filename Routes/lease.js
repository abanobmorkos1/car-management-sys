const express = require('express');
const { addCar, getAllCars, deleteCar , updateCar } = require('../Controllers/leasecontroller');

const router = express.Router();

// Add a lease return
router.post('/createlr', addCar);

// Get all lease returns
router.get('/getlr', getAllCars);

// Delete a lease by ID
router.delete('/deletelLr/:id', deleteCar);

// Update a lease by ID

router.put('/updateLr/:id', updateCar);



module.exports = router;
