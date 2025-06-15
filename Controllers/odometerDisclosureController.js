const OdometerDamageDisclosure = require('../Schema/odometer_damage_disclosures');
const LeaseReturn = require('../Schema/lease');
const { default: mongoose } = require('mongoose');

const createDisclosure = async (req, res) => {
  try {
    const disclosure = new OdometerDamageDisclosure(req.body);
    const saved = await disclosure.save();
    await LeaseReturn.findByIdAndUpdate(
      req.body.leaseReturnId,
      { odometerDisclosure: saved._id },
      { new: true }
    );
    console.log('✅ Odometer disclosure created successfully:', saved);
    res.status(201).json(saved);
  } catch (err) {
    if (err.code === 11000) {
      mongoose.connection.dropCollection('odometer_damage_disclosures');
    }
    res.status(500).json({
      message: 'Server error',
      error: err.message,
    });
  }
};

const updateDisclosure = async (req, res) => {
  try {
    const updated = await OdometerDamageDisclosure.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Odometer disclosure not found' });
    }

    res.json(updated);
  } catch (err) {
    console.error('❌ Failed to update odometer disclosure:', err);
    res.status(500).json({
      message: 'Failed to update disclosure',
      error: err.message,
    });
  }
};

const getDisclosures = async (req, res) => {
  try {
    let { page = 1, limit = 10, searchText = '' } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    let filter = {};

    if (searchText) {
      const regex = new RegExp(searchText, 'i');
      filter = {
        $or: [
          { 'vehicleInfo.vin': regex },
          { 'vehicleInfo.make': regex },
          { 'vehicleInfo.model': regex },
          { 'seller.name': regex },
          { 'newOwner.name': regex },
        ],
      };
    }

    const skip = (page - 1) * limit;
    const total = await OdometerDamageDisclosure.countDocuments(filter);

    const disclosures = await OdometerDamageDisclosure.find(filter)
      .populate('leaseReturnId', 'vin customerName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      disclosures,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('❌ Failed to fetch odometer disclosures:', err);
    res.status(500).json({
      message: 'Failed to fetch disclosures',
      error: err.message,
    });
  }
};

const getDisclosureById = async (req, res) => {
  try {
    const disclosure = await OdometerDamageDisclosure.findById(
      req.params.id
    ).populate('leaseReturnId', 'vin customerName address city state zip');

    if (!disclosure) {
      return res.status(404).json({ message: 'Odometer disclosure not found' });
    }

    res.json(disclosure);
  } catch (err) {
    console.error('❌ Failed to fetch odometer disclosure:', err);
    res.status(500).json({
      message: 'Failed to fetch disclosure',
      error: err.message,
    });
  }
};

const deleteDisclosure = async (req, res) => {
  try {
    const deleted = await OdometerDamageDisclosure.findByIdAndDelete(
      req.params.id
    );

    if (!deleted) {
      return res.status(404).json({ message: 'Odometer disclosure not found' });
    }

    res.json({ message: 'Odometer disclosure deleted successfully' });
  } catch (err) {
    console.error('❌ Failed to delete odometer disclosure:', err);
    res.status(500).json({
      message: 'Failed to delete disclosure',
      error: err.message,
    });
  }
};

module.exports = {
  createDisclosure,
  updateDisclosure,
  getDisclosures,
  getDisclosureById,
  deleteDisclosure,
};
