const express = require('express');
const router = express.Router();
const Car = require('../Schema/newCar');
const upload = require('../Utils/aws');

router.post(
  '/new-car',
  upload.fields([
    { name: 'carImages', maxCount: 7 },
    { name: 'carVideo', maxCount: 3 },
    { name: 'driverIdPicture', maxCount: 2 }
  ]),
  async (req, res) => {
    try {
      console.log('BODY:', req.body);
      console.log('FILES:', req.files);

      const {
        make,
        model,
        year,
        driver,
        damageReport,
        salespersonId
      } = req.body;

      const imageUrls = req.files['carImages']?.map(file => file.location) || [];
      const videoUrl = req.files['carVideo']?.[0]?.location || null;
      const driverIdPictureUrl = req.files['driverIdPicture']?.[0]?.location || null;

      const newCar = new Car({
        make,
        model,
        year: parseInt(year),
        driver,
        salespersonId,
        damageReport,
        pictureUrls: imageUrls,
        videoUrl,
        driverIdPicture: driverIdPictureUrl
      });

      const savedCar = await newCar.save();
      res.status(201).json(savedCar);

    } catch (err) {
      console.error('🔥 SERVER ERROR:', err);
      res.status(500).json({
        error: 'Failed to create car',
        message: err.message,
        stack: err.stack // optional: shows where it happened
      });
    }
  }
);

module.exports = router;
