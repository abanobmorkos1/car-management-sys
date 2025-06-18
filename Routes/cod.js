const express = require('express');
const router = express.Router();
const { verifyToken } = require('../Middleware/auth');
const {
  createCOD,
  deleteCOD,
  updateCOD,
  getAllCOD,
  exportAllCOD,
} = require('../Controllers/codcontroller');

router.post('/newcod', verifyToken, createCOD);

router.delete('/delete/:id', verifyToken, deleteCOD);

router.put('/update/:id', verifyToken, updateCOD);

router.get('/all', verifyToken, getAllCOD);
router.get('/export', verifyToken, exportAllCOD);
module.exports = router;
