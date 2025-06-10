const lease = require('../Schema/lease');
const NewCar = require('../Schema/newCar');
const fetch = require('node-fetch');

const decodeVIN = async (vin) => {
  const res = await fetch(
    `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`
  );
  const data = await res.json();
  const get = (label) =>
    data.Results.find((r) => r.Variable === label)?.Value?.trim() || '';

  return {
    make: get('Make'),
    model: get('Model'),
    trim: get('Trim'),
    year: get('Model Year'),
  };
};

// POST /api/car
const createCar = async (req, res) => {
  try {
    const {
      vin,
      make,
      model,
      trim,
      year,
      salesPerson,
      driver,
      damageReport,
      pictureUrls,
      videoUrl,
      customerName,
      customerPhone,
      customerAddress,
    } = req.body;

    if (!customerName || !customerPhone || !customerAddress) {
      return res.status(400).json({
        message: 'Customer information is required: name, phone, address',
      });
    }

    let sanitizedPhone = customerPhone.replace(/[^0-9]/g, '');
    if (sanitizedPhone.length === 10) {
      sanitizedPhone = `+1${sanitizedPhone}`;
    } else if (sanitizedPhone.length === 11 && sanitizedPhone.startsWith('1')) {
      sanitizedPhone = `+${sanitizedPhone}`;
    }

    const car = new NewCar({
      trim,
      vin,
      make,
      model,
      year,
      salesPerson,
      driver,
      damageReport,
      pictureUrls,
      videoUrl,
      customerName: customerName.trim(),
      customerPhone: sanitizedPhone,
      customerAddress: customerAddress.trim(),
    });

    const saved = await car.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('❌ Failed to create car:', err);
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: 'VIN already exists in the system' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET all
const getCarById = async (req, res) => {
  try {
    const car = await NewCar.findById(req.params.id)
      .populate('driver', 'name') // populate 'name' from driver
      .populate('salesPerson', 'name'); // populate 'name' from salesPersonid

    if (!car) return res.status(404).json({ message: 'Car not found' });
    res.json(car);
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Failed to fetch car', error: err.message });
  }
};

const getAllCars = async (req, res) => {
  try {
    let { searchText = '', page = 1, perPage = 10, driverId = '' } = req.query;
    page = parseInt(page);
    perPage = parseInt(perPage);
    let filter = {};
    if (searchText) {
      const regex = new RegExp(searchText, 'i'); // case-insensitive search
      filter = {
        $or: [
          { vin: regex },
          { make: regex },
          { model: regex },
          { customerName: regex },
        ],
      };
    }
    if (driverId) {
      filter.driver = driverId;
    }
    const total = await NewCar.countDocuments(filter);
    const cars = await NewCar.find(filter)
      .sort({ createdAt: -1 })
      .populate('driver')
      .populate('salesPerson')
      .skip((page - 1) * perPage)
      .limit(perPage);
    res.json({ cars, total });
  } catch (err) {
    console.error('❌ Failed to fetch cars:', err);
    res
      .status(500)
      .json({ message: 'Failed to fetch cars', error: err.message });
  }
};

// PUT update
const updateCar = async (req, res) => {
  try {
    // If updating customer phone, sanitize it
    if (req.body.customerPhone) {
      let sanitizedPhone = req.body.customerPhone.replace(/[^0-9]/g, '');
      if (sanitizedPhone.length === 10) {
        req.body.customerPhone = `+1${sanitizedPhone}`;
      } else if (
        sanitizedPhone.length === 11 &&
        sanitizedPhone.startsWith('1')
      ) {
        req.body.customerPhone = `+${sanitizedPhone}`;
      }
    }

    const car = await NewCar.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!car) return res.status(404).json({ message: 'Car not found' });
    res.json(car);
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Failed to update car', error: err.message });
  }
};

// DELETE
const deleteCar = async (req, res) => {
  try {
    const car = await NewCar.findByIdAndDelete(req.params.id);
    if (!car) return res.status(404).json({ message: 'Car not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Failed to delete car', error: err.message });
  }
};

const checkVin = async (req, res) => {
  try {
    const { vin } = req.query;
    if (!vin) {
      return res.status(400).json({ message: 'VIN is required' });
    }
    const existingCar = await NewCar.findOne({ vin }, { vin: 1 }).lean();

    if (existingCar) {
      return res.status(200).json({ exists: true, car: existingCar });
    }
    res.status(200).json({ exists: existingCar ? true : false });
  } catch (err) {
    console.error('❌ Failed to check VIN:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  createCar,
  getAllCars,
  getCarById,
  updateCar,
  deleteCar,
  checkVin,
};
