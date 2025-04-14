const express = require('express');
const router = express.Router();
const Car = require('../Schema/newCar');
const upload = require('../Utils/aws');

router.post(
  '/new-car',
  upload.fields([
    { name: 'carImages', maxCount: 6 },
    { name: 'carVideo', maxCount: 1 },
    { name: 'driverIdPicture', maxCount: 1 }
  ]),
  async (req, res) => {
    const {
      make,
      model,
      year,
      driver,
      damageReport,
      salespersonId
    } = req.body;

    try {
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

      await newCar.save();
      res.status(201).json(newCar);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: 'Failed to create car', details: err.message });
    }
  }
);

module.exports = router;
