const express = require('express');
const router = express.Router();
const Car = require('../Schema/newCar');
const upload = require('../Utils/aws'); // ✅ Now this works with upload.fields
  // Assuming this is your car model

router.post(
  '/new-car',
  upload.fields([
    { name: 'carImages', maxCount: 6 },
    { name: 'carVideo', maxCount: 1 }
  ]),
  async (req, res) => {
    const { make, model, year, driver, damageReport, salespersonId } = req.body;

    try {
      const imageUrls = req.files['carImages']?.map(file => file.location) || [];
      const videoUrl = req.files['carVideo']?.[0]?.location || null;

      const newCar = new Car({
        make,
        model,
        year,
        driver,
        salespersonId,
        damageReport,
        pictureUrls: imageUrls,
        videoUrl
      });

      await newCar.save();
      res.status(201).json(newCar);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: 'Failed to create car' });
    }
  }
);

module.exports = router;
