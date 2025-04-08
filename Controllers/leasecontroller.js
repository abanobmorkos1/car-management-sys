const express = require("express");
const Lease = require('../Schema/lease');

// Add a new lease return
const addCar = async (req, res) => {
  try {
    const newCar = new Lease(req.body); // Mongoose schema will validate this
    const savedLease = await newCar.save(); // Will trigger the titlePicture validation

    res.status(201).json(savedLease); // Success
  } catch (error) {
    if (error.name === 'ValidationError') {
      // Handle validation errors (like titlePicture required when hasTitle is true)
      return res.status(400).json({
        message: 'Validation error',
        error: error.message
      });
    }

    // Handle unexpected server errors
    res.status(500).json({
      message: 'Server error while adding lease',
      error: error.message
    });
  }
};

// Get all lease returns
const getAllCars = async (req, res) => {
  try {
    const cars = await Lease.find({}); // Get all cars (or lease returns)

    // Format the data by mapping over the cars
    const formattedCars = cars.map(car => ({
      ...car._doc,  // Spread the car object
      createdAt: new Date(car.createdAt).toLocaleString(),    // Format the creation date
      updatedAt: new Date(car.updatedAt).toLocaleString()     // Format the update date
    }));

    res.json(formattedCars);  // Send the formatted data as the response
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching cars', error: error.message });
  }
};

// Delete a lease by ID
const deleteCar = async (req, res) => {
  try {
    const deletedCar = await Lease.findByIdAndDelete(req.params.id);
    
    if (!deletedCar) {
      return res.status(404).json({ message: 'Lease not found' });
    }

    res.status(200).json({ message: 'Lease deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting lease', error: error.message });
  }
};

const updateCar = async (req, res) => {
  try {
    const updatedCar = await Lease.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updatedCar) {
      return res.status(404).json({ message: 'Lease not found' });
    }

    res.status(200).json(updatedCar);

  } catch (error) {
    console.error(error);

    res.status(500).json({ message: 'Server error while updating lease', error: error.message });
  }
};


module.exports = { addCar, getAllCars , deleteCar, updateCar};
