const Lease = require('../Schema/lease');
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const fetch = require('node-fetch');

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const getCarDetailsFromVin = async (vin) => {
  const response = await fetch(
    `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`
  );
  const data = await response.json();
  const results = data.Results;
  const get = (label) =>
    results.find((r) => r.Variable === label)?.Value?.trim() || null;

  return {
    year: get('Model Year'),
    make: get('Make'),
    model: get('Model') || get('Series'),
    trim: get('Trim') || get('Series'),
    bodyStyle: get('Body Class'),
    engine: get('Engine Model') || get('Engine Configuration'),
    fuelType: get('Fuel Type - Primary'),
    driveType: get('Drive Type'),
    plant: get('Plant City'),
    doors: parseInt(get('Doors')) || null,
    transmission: get('Transmission Style'),
  };
};

const addLr = async (req, res) => {
  try {
    const {
      vin,
      miles,
      bank,
      customerName,
      address,
      salesPerson,
      driver,
      damageReport,
      hasTitle,
      city,
      state,
      zip,
      odometerKey,
      titleKey,
      odometerStatementKey,
      leaseReturnMediaKeys = [],
      leftPlates,
      plateNumber,
    } = req.body;

    const vinInfo = await getCarDetailsFromVin(vin);
    if (!vinInfo.make || !vinInfo.model || !vinInfo.year) {
      return res.status(400).json({ message: 'Unable to decode VIN' });
    }

    const lease = new Lease({
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
      city,
      state,
      zip,
      salesPerson,
      driver,
      damageReport,
      hasTitle: hasTitle === 'true',
      odometerKey,
      titleKey: hasTitle === 'true' ? titleKey : null,
      odometerStatementKey, // ✅ ADD THIS
      leaseReturnMediaKeys,
      leftPlates,
      plateNumber: leftPlates ? plateNumber : '',
    });

    const saved = await lease.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('❌ Lease save error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAlllr = async (req, res) => {
  try {
    let { page = 1, limit = 6, searchText = '', status = '' } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    let filter = {};
    if (searchText) {
      const regex = new RegExp(searchText, 'i'); // case-insensitive search
      filter = {
        $or: [
          { vin: regex },
          { make: regex },
          { model: regex },
          { customerName: regex },
          { address: regex },
          { city: regex },
          { state: regex },
          { zip: regex },
        ],
      };
    }
    if (status) {
      filter.groundingStatus = status;
    }
    const skip = (page - 1) * limit;
    const totalCount = await Lease.countDocuments(filter);

    const cars = await Lease.find(filter)
      .populate('salesPerson', 'name email') // only pull name/email
      .populate('driver', 'name ')
      .populate('updatedBy', 'name role')
      .populate('odometerDisclosure')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const formattedCars = cars.map((car) => ({
      ...car._doc,
      salesPerson: car.salesPerson?.name || car.salesPerson?._id,
      driver: car.driver?.name || car.driver?._id,
      createdAt: new Date(car.createdAt).toLocaleString(),
      updatedAt: new Date(car.updatedAt).toLocaleString(),
    }));

    res.status(200).json({
      leases: formattedCars,
      total: totalCount,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error while fetching cars',
      error: error.message,
    });
  }
};

const deleteLr = async (req, res) => {
  try {
    const lease = await Lease.findById(req.params.id);
    if (!lease) return res.status(404).json({ message: 'Lease not found' });

    const allKeys = [
      lease.odometerKey,
      lease.titleKey,
      ...(lease.damageKeys || []),
      ...(lease.damageVideoKeys || []),
      lease.odometerStatementKey,
    ].filter(Boolean);

    await Promise.all(
      allKeys.map((key) =>
        s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
          })
        )
      )
    );

    await lease.deleteOne();
    res.status(200).json({ message: 'Lease deleted successfully' });
  } catch (error) {
    console.error('Error deleting lease:', error);
    res.status(500).json({
      message: 'Server error while deleting lease',
      error: error.message,
    });
  }
};

const updateLr = async (req, res) => {
  try {
    const updatedCar = await Lease.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedCar) {
      return res.status(404).json({ message: 'Lease not found' });
    }
    res.status(200).json(updatedCar);
  } catch (error) {
    res.status(500).json({
      message: 'Server error while updating lease',
      error: error.message,
    });
  }
};

const getLeaseByVin = async (req, res) => {
  try {
    const vin = req.params.vin.toUpperCase();
    const lease = await Lease.findOne({ vin });
    if (!lease) {
      return res
        .status(404)
        .json({ message: 'No lease return found for this VIN' });
    }
    res.status(200).json(lease);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update lease return status
const setLeaseReturnStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { returnStatus } = req.body;

    const leaseReturn = await LeaseReturn.findById(id);
    if (!leaseReturn)
      return res.status(404).json({ message: 'Lease return not found' });

    // Only Sales and Owner can update
    if (!['Sales', 'Owner'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    leaseReturn.returnStatus = returnStatus;
    await leaseReturn.save();

    res.status(200).json({ message: 'Status updated', leaseReturn });
  } catch (err) {
    console.error('Error updating lease return status:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateGroundingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Ground', 'Buy', 'In Progress', 'Grounded', ''].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    if (
      status === 'Grounded' &&
      !['Driver', 'Management'].includes(req.user.role)
    ) {
      return res.status(403).json({
        message: 'Only drivers or management can finalize grounding.',
      });
    }

    const updated = await Lease.findByIdAndUpdate(
      id,
      {
        groundingStatus: status,
        updatedBy: req.user.id,
        statusUpdatedAt: new Date(),
      },
      { new: true }
    )
      .populate('updatedBy', 'name role')
      .populate('salesPerson', 'name')
      .populate('driver', 'name');

    res.json(updated);
  } catch (err) {
    console.error('Error updating lease status:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  addLr,
  getAlllr,
  deleteLr,
  updateLr,
  getLeaseByVin,
  setLeaseReturnStatus,
  updateGroundingStatus,
};
