const NewCar = require('../Schema/newCar');
const fetch = require('node-fetch');

const decodeVIN = async (vin) => {
  const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`);
  const data = await res.json();
  const get = (label) => data.Results.find(r => r.Variable === label)?.Value?.trim() || '';

  return {
    make: get('Make'),
    model: get('Model'),
    trim: get('Trim'),
    year: get('Model Year')
  };
};

// POST /api/car
const createCar = async (req, res) => {
  try {
    const { vin, salesPerson, driver, damageReport, pictureUrls, videoUrl, driverIdPicture } = req.body;
    const decoded = await decodeVIN(vin);

    console.log('📥 Incoming body:', req.body)

    const car = new NewCar({
      make: decoded.make,
      model: decoded.model,
      year: parseInt(decoded.year),
      salesPerson,
      driver,
      damageReport,
      pictureUrls,
      videoUrl,
      driverIdPicture
    });

    const saved = await car.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('❌ Failed to create car:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET all
const getCarById = async (req, res) => {
  try {
    const car = await NewCar.findById(req.params.id)
      .populate('driver', 'name')         // populate 'name' from driver
      .populate('salesPerson', 'name'); // populate 'name' from salesPersonid

    if (!car) return res.status(404).json({ message: 'Car not found' });
    res.json(car);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch car', error: err.message });
  }
};


// GET by ID
const getAllCars = async (req, res) => {
  try {
    const cars = await NewCar.find()
      .populate('driver', 'name')
      .populate('salesPerson', 'name');

    res.json(cars); // ✅ Must return an array
  } catch (err) {
    console.error('❌ Failed to fetch cars:', err);
    res.status(500).json({ message: 'Failed to fetch cars', error: err.message });
  }
};


// PUT update
const updateCar = async (req, res) => {
  try {
    const car = await NewCar.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!car) return res.status(404).json({ message: 'Car not found' });
    res.json(car);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update car', error: err.message });
  }
};

// DELETE
const deleteCar = async (req, res) => {
  try {
    const car = await NewCar.findByIdAndDelete(req.params.id);
    if (!car) return res.status(404).json({ message: 'Car not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete car', error: err.message });
  }
};

module.exports = {
  createCar,
  getAllCars,
  getCarById,
  updateCar,
  deleteCar
};
