const express = require('express');
const router = express.Router();
const upload = require('../Utils/aws');
const {
  createNewCar,
  getAllNewCars,
  deleteNewCar,
  updateNewCar
} = require('../Controllers/newcarcontroller');
const auth = require('../Middleware/auth');

router.post(
  '/new-car',
  (req, res, next) => { req.uploadType = 'cars'; next(); },
  upload.fields([
    { name: 'carImages', maxCount: 7 },
    { name: 'carVideo', maxCount: 3 },
    { name: 'driverIdPicture', maxCount: 2 }
  ]),
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
