const express = require('express');
const { verifyToken } = require('../Middleware/auth');
const { clockIn, clockOut , getWeeklyHours , getClockInStatus, overrideHours} = require('../Controllers/hoursController');
const { getTodaySessions } = require('../Controllers/getTodaySessions');
const router = express.Router();
router.post('/clock-in', verifyToken, clockIn);
router.post('/clock-out', verifyToken, clockOut);
router.get('/weekly-hours', verifyToken, getWeeklyHours);
router.get('/status', verifyToken, getClockInStatus);
router.get('/today-sessions', verifyToken, getTodaySessions);
router.put('/override/:id', verifyToken, overrideHours);


module.exports = router;
