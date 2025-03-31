const express = require('express');
const { addCar, getAllCars } = require('../Controllers/carcontroller')

const router = express.Router();

router.post('/createlr', addCar);
router.get('/getlr', getAllCars);

module.exports = router;
