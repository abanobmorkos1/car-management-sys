const express = require('express');
const router = express.Router();
const {
  createNewCar,
  getAllNewCars,
  deleteNewCar,
  updateNewCar
} = require('../Controllers/newcarcontroller');
const { verifyToken } = require('../Middleware/auth');


router.post(
  '/new-car',
  verifyToken,
  createNewCar
);
// ✅ GET all
router.get('/all', getAllNewCars);

// ✅ UPDATE car by ID
router.put('/update/:id', updateNewCar);

// ✅ DELETE car by ID
router.delete('/delete/:id', deleteNewCar);

router.get('/all',  getAllNewCars);


module.exports = router;
