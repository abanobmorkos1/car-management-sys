const express = require('express');
const router = express.Router();
const upload = require('../Utils/aws');
const { createCOD } = require('../Controllers/codcontroller');

router.post(
  '/newcod',
  upload.fields([
    { name: 'contractPicture', maxCount: 3 },
    { name: 'checkPicture', maxCount: 1 }
  ]),
  createCOD
);

module.exports = router;
