const express = require('express');
const { verifyToken } = require('../Middleware/auth');
const {
  getPendingClockIns,
  approveClockIn,
  rejectClockIn,
  overrideHours,
  getSessionsByDate,
  getWeeklyHoursAll,
  getWeeklyEarnings,
  assignDriver
} = require('../Controllers/managerHours.controller');

const { getTodaySessions } = require('../Controllers/getTodaySessions') ; // Correct import

const router = express.Router();

router.get('/pending', verifyToken, getPendingClockIns);
router.put('/approve/:id', verifyToken, approveClockIn);
router.put('/reject/:id', verifyToken, rejectClockIn);
router.put('/override/:id', verifyToken, overrideHours);
router.get('/today-sessions', verifyToken, getTodaySessions);
router.get('/sessions-by-date', verifyToken, getSessionsByDate);
router.get('/weekly-hours', verifyToken, getWeeklyEarnings);
router.put('/assign-driver/:id', verifyToken, assignDriver);

module.exports = router;
