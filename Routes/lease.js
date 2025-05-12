const express = require('express');
const { addLr, getAlllr, deleteLr , updateLr , getLeaseByVin } = require('../Controllers/leasecontroller');
const router = express.Router();
const Car = require('../Schema/lease');
const upload = require('../Utils/aws');
const { verifyToken } = require('../Middleware/auth');

const getCarDetailsFromVin = async (vin) => {
    const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`);
    const data = await response.json();
    const results = data.Results;
  
    const get = (label) =>
      results.find((r) => r.Variable === label)?.Value?.trim() || null;
  
    return {
      vin,
  year: parseInt(vinInfo.year),
  make: vinInfo.make,
  model: vinInfo.model,
  trim: vinInfo.trim,
  bodyStyle: vinInfo.bodyStyle,
  engine: vinInfo.engine,
  fuelType: vinInfo.fuelType,
  driveType: vinInfo.driveType,
  plant: vinInfo.plant,
  doors: vinInfo.doors,
  transmission: vinInfo.transmission,
  miles,
  bank,
  customerName,
  address,
  salesPerson,
  driver,
  damageReport,
  hasTitle: hasTitle === 'true',
  titlePicture,
  odometerPicture,           // ✅ MUST INCLUDE
  damagePictures             // ✅ MUST INCLUDE
}};
  
  
// Add a lease return
router.post(
  '/createlr',
  verifyToken,
  (req, res, next) => { req.uploadType = 'cars'; next(); },
  upload.fields([
    { name: 'odometer', maxCount: 1 },
    { name: 'title', maxCount: 1 },
    { name: 'damagePictures', maxCount: 10 },
    { name: 'damageVideos', maxCount: 3 }
  ]),
  addLr
);

// Get all lease returns
router.get('/getlr', getAlllr);

// Delete a lease by ID
router.delete('/deleteLr/:id', deleteLr);

// Update a lease by ID
router.put('/updateLr/:id', updateLr);

//  NEW: Search by VIN
router.get('/by-vin/:vin', getLeaseByVin);

module.exports = router;
