const express = require('express');
const { verifyToken } = require('../Middleware/auth');
const {
  requestClockIn,
  clockOut,
  getClockInStatus,
  getWeeklyEarnings,
  getWeeklyBreakdown,
  clockIn,
} = require('../Controllers/driverHours.controller');

const router = express.Router();
router.post('/clock-in-request', verifyToken, requestClockIn);
router.post('/clock-out', verifyToken, clockOut);
router.get('/status', verifyToken, getClockInStatus);
router.get('/weekly-earnings', verifyToken, getWeeklyEarnings);
router.get('/weekly-breakdown', verifyToken, getWeeklyBreakdown);

module.exports = router;
