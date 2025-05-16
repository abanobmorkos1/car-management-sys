const Car = require('../Schema/newCar');

const createNewCar = async (req, res) => {
  try {
    const {
      make, model, year, driver, damageReport,
      salesPersonid, pictureKeys = [], videoKey, driverIdPictureKey
    } = req.body;

    const newCar = new Car({
      make,
      model,
      year: parseInt(year),
      driver,
      salesPersonid,
      damageReport,
      pictureUrls: pictureKeys,
      videoUrl: videoKey,
      driverIdPicture: driverIdPictureKey
    });

    const savedCar = await newCar.save();
    res.status(201).json(savedCar);
  } catch (err) {
    console.error('🔥 SERVER ERROR:', err);
    res.status(500).json({
      error: 'Failed to create car',
      message: err.message,
      stack: err.stack
    });
  }
};

const getAllNewCars = async (req, res) => {
  try {
    const cars = await Car.find().populate('salesPersonid', 'name email');

    const formattedCars = cars.map(car => ({
      ...car._doc,
      createdAt: new Date(car.createdAt).toLocaleString(),
      updatedAt: new Date(car.updatedAt).toLocaleString()
    }));

    res.status(200).json(formattedCars);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cars', message: err.message });
  }
};

  // ✅ DELETE car by ID
const deleteNewCar = async (req, res) => {
  try {
    const deleted = await Car.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.status(200).json({ message: 'Car deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete car', error: err.message });
  }
};

// ✅ UPDATE car by ID
const updateNewCar = async (req, res) => {
  try {
    const updated = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update car', error: err.message });
  }
};

module.exports = {
  createNewCar,
  getAllNewCars,
  deleteNewCar,
  updateNewCar
};
