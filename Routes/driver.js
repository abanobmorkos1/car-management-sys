const express = require('express');
const router = express.Router();
const driverController = require('../Controllers/Drivercontroller');
const { verifyToken } = require('../Middleware/auth'); // ✅ Correct usage
const upload = require('../Utils/uploads'); // ✅ multer instance

// Upload review or customer bonus photo
router.post(
  '/upload-bonus',
  verifyToken,
  (req, res, next) => {
    req.uploadType = 'bonuses';
    next();
  },
  upload.single('image'),
  driverController.uploadBonus
);

// Clock in/out and bonus tracking
router.post('/clockin', verifyToken, driverController.clockIn);
router.put('/clockout', verifyToken, driverController.clockOut);
router.get('/bonuses', verifyToken, driverController.getBonuses);

module.exports = router;
