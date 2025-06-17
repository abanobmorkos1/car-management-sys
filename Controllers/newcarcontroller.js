const NewCar = require('../Schema/newCar');
const CarUploadDoc = require('../Schema/car_upload_doc');

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

const createPdfAgreement = async (req, res) => {
  try {
    const {
      nameOfConsumer,
      addressOfConsumer,
      leaseOrPurchase,
      make,
      model,
      year,
      vin,
      customOptions,
      modificationFacility,
      automobilePurchasedFrom,
      priceOfVehicle,
      estimatedPrice,
      estimatedDeliveryDate,
      placeOfDelivery,
      consumerSignature,
      signatureDate,
      carId,
    } = req.body;

    if (!carId) {
      return res.status(400).json({ message: 'Car ID is required' });
    }

    // Check if car exists
    const car = await NewCar.findById(carId);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    const pdfAgreement = new CarUploadDoc({
      nameOfConsumer: nameOfConsumer || '',
      addressOfConsumer: addressOfConsumer || 'N/A',
      leaseOrPurchase: leaseOrPurchase || '',
      make: make || car.make || 'N/A',
      model: model || car.model || 'N/A',
      year: year || car.year?.toString() || 'N/A',
      vin: vin || car.vin || 'N/A',
      customOptions: customOptions || 'N/A',
      modificationFacility: modificationFacility || 'N/A',
      automobilePurchasedFrom: automobilePurchasedFrom || 'N/A',
      priceOfVehicle: priceOfVehicle || 'N/A',
      estimatedPrice: estimatedPrice || 'N/A',
      estimatedDeliveryDate: estimatedDeliveryDate || 'N/A',
      placeOfDelivery: placeOfDelivery || 'N/A',
      consumerSignature: consumerSignature || 'N/A',
      signatureDate: signatureDate || 'N/A',
      carId,
    });

    const saved = await pdfAgreement.save();

    await NewCar.findByIdAndUpdate(carId, { carUploadDoc: saved._id });

    res.status(201).json({
      message: 'PDF Agreement created successfully',
      pdfAgreement: saved,
    });
  } catch (err) {
    console.error('❌ Failed to create PDF agreement:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getPdfAgreement = async (req, res) => {
  try {
    const { carId } = req.params;

    const pdfAgreement = await CarUploadDoc.findOne({ carId }).populate(
      'carId',
      'make model year vin customerName'
    );

    if (!pdfAgreement) {
      return res
        .status(404)
        .json({ message: 'PDF Agreement not found for this car' });
    }

    res.json(pdfAgreement);
  } catch (err) {
    console.error('❌ Failed to fetch PDF agreement:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updatePdfAgreement = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await CarUploadDoc.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate('carId', 'make model year vin customerName');

    if (!updated) {
      return res.status(404).json({ message: 'PDF Agreement not found' });
    }

    res.json({
      message: 'PDF Agreement updated successfully',
      pdfAgreement: updated,
    });
  } catch (err) {
    console.error('❌ Failed to update PDF agreement:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deletePdfAgreement = async (req, res) => {
  try {
    const { id } = req.params;

    const pdfAgreement = await CarUploadDoc.findById(id);
    if (!pdfAgreement) {
      return res.status(404).json({ message: 'PDF Agreement not found' });
    }

    // Remove reference from car
    await NewCar.findByIdAndUpdate(pdfAgreement.carId, {
      $unset: { carUploadDoc: 1 },
    });

    await CarUploadDoc.findByIdAndDelete(id);

    res.json({ message: 'PDF Agreement deleted successfully' });
  } catch (err) {
    console.error('❌ Failed to delete PDF agreement:', err);
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
  createPdfAgreement,
  getPdfAgreement,
  updatePdfAgreement,
  deletePdfAgreement,
};
