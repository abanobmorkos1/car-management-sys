const express = require('express');
const router = express.Router();
const driverController = require('../Controllers/Drivercontroller');
const auth = require('../Middleware/auth');

router.post(
  '/upload-bonus',
  auth,
  (req, res, next) => { req.uploadType = 'bonuses'; next(); },
  upload.single('image'),
  driverController.uploadBonus
);
router.post('/clockin', auth, driverController.clockIn);
router.put('/clockout', auth, driverController.clockOut);
router.get('/bonuses', auth, driverController.getBonuses);
