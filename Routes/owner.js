const express = require('express');
const { getOwnerStats } = require('../Controllers/ownerController');
const { verifyToken } = require('../Middleware/auth');

const router = express.Router();

router.get('/stats', verifyToken, getOwnerStats);

module.exports = router;
