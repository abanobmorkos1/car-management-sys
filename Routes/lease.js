const express = require('express');
const { addLr, getAlllr, deleteLr , updateLr } = require('../Controllers/leasecontroller');
const router = express.Router();
const Car = require('../Schema/lease');
const upload = require('../Utils/aws');

const getCarDetailsFromVin = async (vin) => {
    const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`);
    const data = await response.json();
    const results = data.Results;
  
    const get = (label) =>
      results.find((r) => r.Variable === label)?.Value?.trim() || null;
  
    return {
      year: get('Model Year'),
      make: get('Make'),
      model: get('Model') || get('Series'),
      trim: get('Trim') || get('Model Trim') || get('Base Trim'),
      bodyStyle: get('Body Class'),
      engine: get('Engine Model') || get('Engine Configuration'),
      fuelType: get('Fuel Type - Primary'),
      driveType: get('Drive Type'),
      plant: get('Plant City'),
      doors: parseInt(get('Doors')) || null,
      transmission: get('Transmission Style')
    };
  };
  
// Add a lease return
router.post('/createlr', addLr);

// Get all lease returns
router.get('/getlr', getAlllr);

// Delete a lease by ID
router.delete('/deletelLr/:id', deleteLr);

// Update a lease by ID
router.put('/updateLr/:id', updateLr);

module.exports = router;
