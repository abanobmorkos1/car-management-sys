const express = require("express");
const router = express.Router();
const Lease = require('../Schema/Lease');

// Add a new lease return
const addCar = async (req, res) => {
  try {
    const newCar = new Lease(req.body);
    const saveLr = await newCar.save();
    res.status(201).json(saveLr);
  } catch (error) {
    res.status(500).json({ message: 'Server error while adding car', error: error.message });
  }
};

// Get all lease returns
const getAllCars = async (req, res) => {
  try {
    const cars = await Lease.find({});
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching cars', error: error.message });
  }
};

module.exports = { addCar, getAllCars };
