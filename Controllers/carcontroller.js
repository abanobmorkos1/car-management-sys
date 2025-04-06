// routes/carRoutes.js
const express = require('express');
const router = express.Router();
const Car = require('../models/carModel');  // Assuming this is your car model
const upload = require('../Utils/aws');  // Importing the AWS file upload configuration

// Create a new car and upload the image/video
router.post('/new-car', upload.fields([{ name: 'carImage', maxCount: 1 }, { name: 'carVideo', maxCount: 1 }]), async (req, res) => {
  const { make, model, year, driver, damageReport } = req.body;

  try {
    // Store the S3 URLs of uploaded files
    const carImageURL = req.files['carImage'] ? req.files['carImage'][0].location : null;
    const carVideoURL = req.files['carVideo'] ? req.files['carVideo'][0].location : null;

    // Create a new car document
    const newCar = new Car({
      make,
      model,
      year,
      driver,
      damageReport,
      carImage: carImageURL,
      carVideo: carVideoURL,
    });

    await newCar.save();
    res.status(201).json(newCar);  // Respond with the newly created car
  } catch (err) {
    res.status(400).json({ error: 'Failed to create car' });
  }
});

module.exports = router;
