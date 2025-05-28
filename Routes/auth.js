const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  logout,
  getDrivers,
  checkSession,
} = require('../Controllers/authcontrollers');

// @route   POST /api/auth/register
router.post('/register', registerUser);

// @route   POST /api/auth/login
router.post('/login', loginUser);

// @route   POST /api/auth/logout
router.post('/logout', logout);


// @route   GET /api/auth/session
router.get('/sessions', checkSession);

// @route   GET /api/users/drivers
router.get('/drivers', getDrivers);

module.exports = router;
