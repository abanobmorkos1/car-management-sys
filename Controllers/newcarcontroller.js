const Car = require('../Schema/newCar');

exports.createNewCar = async (req, res) => {
  try {
    console.log('BODY:', req.body);
    console.log('FILES:', req.files);

    const {
      make,
      model,
      year,
      driver,
      damageReport,
      salesPersonid
    } = req.body;

    const imageUrls = req.files['carImages']?.map(file => file.location) || [];
    const videoUrl = req.files['carVideo']?.[0]?.location || null;
    const driverIdPictureUrl = req.files['driverIdPicture']?.[0]?.location || null;

    const newCar = new Car({
      make,
      model,
      year: parseInt(year),
      driver,
      salesPersonid,
      damageReport,
      pictureUrls: imageUrls,
      videoUrl,
      driverIdPicture: driverIdPictureUrl
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

exports.getAllNewCars = async (req, res) => {
    try {
      const cars = await Car.find().populate('salesPersonid', 'name email'); // ✅ FIXED
      res.status(200).json(cars);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch cars', message: err.message });
    }
  }