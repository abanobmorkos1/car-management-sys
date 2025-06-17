const express = require('express');
const { verifyToken } = require('../Middleware/auth');
const {
  createCar,
  getAllCars,
  getCarById,
  updateCar,
  deleteCar,
  checkVin,
  createPdfAgreement,
  getPdfAgreement,
  updatePdfAgreement,
  deletePdfAgreement,
} = require('../Controllers/newcarcontroller');

const router = express.Router();

router.get('/check-vin', verifyToken, checkVin);
router.post('/', verifyToken, createCar);
router.get('/', verifyToken, getAllCars);
router.get('/:id', verifyToken, getCarById);
router.put('/:id', verifyToken, updateCar);
router.delete('/:id', verifyToken, deleteCar);

router.post('/pdf-agreement', verifyToken, createPdfAgreement);
router.get('/pdf-agreement/:carId', verifyToken, getPdfAgreement);
router.put('/pdf-agreement/:id', verifyToken, updatePdfAgreement);
router.delete('/pdf-agreement/:id', verifyToken, deletePdfAgreement);

module.exports = router;
