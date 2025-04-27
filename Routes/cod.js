const express = require('express');
const router = express.Router();
const upload = require('../Utils/aws');
const { verifyToken } = require('../Middleware/auth'); // Import your auth middleware

const {
  createCOD,
  deleteCOD,
  updateCOD,
  getAllCOD,
  searchCODByCustomer
} = require('../Controllers/codcontroller');

router.post(
  '/newcod',
  verifyToken,
  (req, res, next) => { req.uploadType = 'cod'; next(); },
  upload.fields([
    { name: 'contractPicture', maxCount: 3 },
    { name: 'checkPicture', maxCount: 1 }
  ]),
  createCOD
);

// Delete COD
router.delete('/delete/:id', deleteCOD);

// Update COD
router.put('/update/:id', updateCOD);

// Get all CODs
router.get('/all', getAllCOD);

// Search CODs by customer name
router.get('/search/:name', searchCODByCustomer);
module.exports = router;
