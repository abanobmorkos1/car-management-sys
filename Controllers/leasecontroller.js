const Lease = require('../Schema/lease');
const generateOdometerPDF = require('../Utils/generateOdometerPDF');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const fetch = require('node-fetch');

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const getCarDetailsFromVin = async (vin) => {
  const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`);
  const data = await response.json();
  const results = data.Results;
  const get = (label) => results.find(r => r.Variable === label)?.Value?.trim() || null;

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
    transmission: get('Transmission Style')
  };
};

const addLr = async (req, res) => {
  try {
    const {
      vin, miles, bank, customerName, address,
      salesPerson, driver, damageReport, hasTitle,
      signatureBase64, city, state, zip, date
    } = req.body;

    const vinInfo = await getCarDetailsFromVin(vin);
    if (!vinInfo.make || !vinInfo.model || !vinInfo.year) {
      return res.status(400).json({ message: 'Unable to decode VIN' });
    }

    const odometerFile = req.files['odometer']?.[0];
    const titleFile = req.files['title']?.[0];
    const damageImages = req.files['damagePictures'] || [];
    const damageVideos = req.files['damageVideos'] || [];

    if (!odometerFile) return res.status(400).json({ message: 'Odometer picture is required' });
    if (hasTitle === 'true' && !titleFile) return res.status(400).json({ message: 'Title picture is required' });

    let odometerPdfUrl = null;
    let odometerPdfKey = null;
    let documents = [];

    if (signatureBase64) {
      const pdfBuffer = await generateOdometerPDF({
        customerName,
        salesPerson,
        address,
        city,
        state,
        zip,
        vin,
        year: vinInfo.year,
        make: vinInfo.make,
        model: vinInfo.model,
        bodyType: vinInfo.bodyStyle,
        miles,
        date,
        signatureBase64
      });

      const filename = `customers/${customerName.replace(/\s+/g, '_')}/lease_returns/${Date.now()}_odometer.pdf`;

      await s3.send(new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: filename,
        Body: Buffer.from(pdfBuffer),
        ContentType: 'application/pdf'
      }));

      odometerPdfKey = filename;
      odometerPdfUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;

      documents.push({
        type: 'odometer_statement',
        url: odometerPdfUrl,
        key: odometerPdfKey,
        uploadedAt: new Date()
      });
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
      odometerPicture: odometerFile.location,
      odometerKey: odometerFile.key,
      titlePicture: titleFile?.location || null,
      titleKey: titleFile?.key || null,
      damagePictures: damageImages.map(f => f.location),
      damageKeys: damageImages.map(f => f.key),
      damageVideos: damageVideos.map(f => f.location),
      damageVideoKeys: damageVideos.map(f => f.key),
      odometerStatementUrl: odometerPdfUrl,
      odometerStatementKey: odometerPdfKey,
      documents
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
    const cars = await Lease.find({});
    const formattedCars = cars.map(car => ({
      ...car._doc,
      createdAt: new Date(car.createdAt).toLocaleString(),
      updatedAt: new Date(car.updatedAt).toLocaleString()
    }));
    res.json(formattedCars);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching cars', error: error.message });
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
      lease.odometerStatementKey
    ].filter(Boolean);

    await Promise.all(allKeys.map(key =>
      s3.send(new DeleteObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME, Key: key }))
    ));

    await lease.deleteOne();
    res.status(200).json({ message: 'Lease deleted successfully' });
  } catch (error) {
    console.error('Error deleting lease:', error);
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
    res.status(500).json({ message: 'Server error while updating lease', error: error.message });
  }
};

const getLeaseByVin = async (req, res) => {
  try {
    const vin = req.params.vin.toUpperCase();
    const lease = await Lease.findOne({ vin });
    if (!lease) {
      return res.status(404).json({ message: 'No lease return found for this VIN' });
    }
    res.status(200).json(lease);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  addLr,
  getAlllr,
  deleteLr,
  updateLr,
  getLeaseByVin
};
