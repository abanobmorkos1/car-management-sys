const express = require('express');
const router = express.Router();
const Car = require('../Schema/newCar');
const upload = require('../Utils/aws');

// vin decoder function
const getCarDetailsFromVin = async (vin) => {
  const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`);
  const data = await response.json();
  const results = data.Results;

  return {
    year: results.find(r => r.Variable === 'Model Year')?.Value,
    make: results.find(r => r.Variable === 'Make')?.Value,
    model: results.find(r => r.Variable === 'Model')?.Value
  };
};


router.post(
  '/new-car',
  upload.fields([
    { name: 'carImages', maxCount: 6 },
    { name: 'carVideo', maxCount: 1 },
    { name: 'driverIdPicture', maxCount: 1 }
  ]),
  async (req, res) => {
    const { vin, driver, damageReport, salespersonId } = req.body;

    try {
      const vinData = await getCarDetailsFromVin(vin);

      if (!vinData.year || !vinData.make || !vinData.model) {
        return res.status(400).json({ error: 'Invalid VIN or unable to decode car info' });
      }

      const imageUrls = req.files['carImages']?.map(file => file.location) || [];
      const videoUrl = req.files['carVideo']?.[0]?.location || null;
      const driverIdPictureUrl = req.files['driverIdPicture']?.[0]?.location || null;

      const newCar = new Car({
        vin,
        make: vinData.make,
        model: vinData.model,
        year: parseInt(vinData.year),
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
