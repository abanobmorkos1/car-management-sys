const express = require('express');
const router = express.Router();
const driverController = require('../Controllers/Drivercontroller');
const { verifyToken } = require('../Middleware/auth');

// 👉 NEW: Save S3 upload reference to DB after direct upload
router.post('/save-upload', verifyToken, driverController.saveUpload);

// 👉 STILL USED
router.get('/my-uploads', verifyToken, driverController.getMyUploads);
router.delete('/delete-upload/:id', verifyToken, driverController.deleteUpload);
router.get('/bonuses', verifyToken, driverController.getBonuses);

module.exports = router;
