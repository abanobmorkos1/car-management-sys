const express = require('express');
const router = express.Router();
const Car = require('../Schema/lease.js');
const bodyParser = require('body-parser');
const app = express();


app.use(express.json())
app.use(bodyParser.json())
// Add a new car
router.post('/leasereturn', async (req, res) => {
  try {
    const {year,make ,model ,miles ,vin ,bank ,customerName ,address ,salesPerson,driver,pickedDate, damageReport } = req.body;
    const newCar = new Car({
      year,
      make,
      model,
      miles,
      vin,
      bank,
      customerName,
      address,
      salesPerson,
      driver,
      pickedDate,
      damageReport,
    });

   const saveLr=  await newCar.save();
    res.status(201).json(saveLr);
  } catch (error) {
    res.status(500).json({ message: "Server error while adding car" });
  }
});

// Get all cars
router.get('/all', async (req, res) => {
  try {
    const cars = await Car.find({});
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching cars" });
  }
});

module.exports = router;
