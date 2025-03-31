const Car = require('../models/Car');

// Add Car
const addCar = async (req, res) => {
  const { make, model, year, pricePerDay } = req.body;
  try {
    const car = await Car.create({ make, model, year, pricePerDay });
    res.status(201).json(car);
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

// Get All Cars
const getAllCars = async (req, res) => {
  try {
    const cars = await Car.find({});
    res.json(cars);
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

module.exports = { addCar, getAllCars };
