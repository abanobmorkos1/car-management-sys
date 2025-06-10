const express = require('express');
const { verifyToken } = require('../Middleware/auth');
const {
  createCar,
  getAllCars,
  getCarById,
  updateCar,
  deleteCar,
  checkVin,
} = require('../Controllers/newcarcontroller');

const router = express.Router();

router.get('/check-vin', verifyToken, checkVin);
router.post('/', verifyToken, createCar);
router.get('/', verifyToken, getAllCars);
router.get('/:id', verifyToken, getCarById);
router.put('/:id', verifyToken, updateCar);
router.delete('/:id', verifyToken, deleteCar);

module.exports = router;
