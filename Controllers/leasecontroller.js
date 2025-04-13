const express = require("express");
const Lease = require('../Schema/lease');

const getCarDetailsFromVin = async (vin) => {
  const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`);
  const data = await response.json();
  const results = data.Results;

  // DEBUG LOG – this will show you all fields returned
  // console.log('Decoded VIN Results:', JSON.stringify(results, null, 2));

  const get = (label) => results.find(r => r.Variable === label)?.Value?.trim() || null;

  return {
    year: get('Model Year'),
    make: get('Make'),
    model: get('Model') || get('Series') || get('Vehicle Type'),
    trim: get('Trim') || get('Series') || get('Model Trim') || get('Base Trim'),
    bodyStyle: get('Body Class'),
    engine: get('Engine Model') || get('Engine Configuration'),
    fuelType: get('Fuel Type - Primary'),
    driveType: get('Drive Type'),
    plant: get('Plant City'),
    doors: parseInt(get('Doors')) || null,
    transmission: get('Transmission Style')
  };
};


// Add a new lease return
const addLr = async (req, res) => {
  try {
    const {
      vin, miles, bank, customerName, address,
      salesPerson, driver, damageReport, hasTitle, titlePicture
    } = req.body;

    const vinInfo = await getCarDetailsFromVin(vin);

    if (!vinInfo.make || !vinInfo.model || !vinInfo.year) {
      return res.status(400).json({ message: 'Unable to decode VIN' });
    }

    const newLease = new Lease({
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
      hasTitle,
      titlePicture
    });

    const savedLease = await newLease.save();
    res.status(201).json(savedLease);
  } catch (err) {
    console.error('Error creating lease:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all lease returns
const getAlllr = async (req, res) => {
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
const deleteLr = async (req, res) => {
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

const updateLr = async (req, res) => {
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


module.exports = { addLr, getAlllr , deleteLr, updateLr};
