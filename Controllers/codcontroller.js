const COD = require('../Schema/cod');
const Delivery = require('../Schema/deliveries'); // ✅ Needed for delivery lookup

// ✅ CREATE COD with lease return check
const createCOD = async (req, res) => {
  try {
    const {
      customerName,
      phoneNumber,
      address,
      amount,
      method,
      contractKey,
      checkKey,
      salesperson,
      driver,
      car,
      delivery,
    } = req.body;

    if (!salesperson || !driver) {
      return res
        .status(400)
        .json({ message: 'Salesperson and driver are required.' });
    }

    if (!delivery) {
      return res
        .status(400)
        .json({ message: 'Delivery reference is required.' });
    }

    const cod = new COD({
      customerName,
      phoneNumber,
      address,
      amount: amount || 0,
      method: amount > 0 ? method : 'None',
      contractPicture: contractKey || '',
      checkPicture: checkKey || '',
      salesperson,
      driver,
      delivery,
      car: {
        year: car?.year || '',
        make: car?.make || '',
        model: car?.model || '',
        trim: car?.trim || '',
        color: car?.color || '',
      },
    });

    await cod.save();

    // ✅ Check if lease return is required
    const deliveryDoc = await Delivery.findById(delivery);
    if (deliveryDoc?.leaseReturn?.willReturn) {
      return res.status(201).json({
        message: 'COD created. Redirect to lease return.',
        redirect: `/driver/lease-return/from-delivery/${delivery}`,
      });
    }

    return res.status(201).json({
      message: 'COD created successfully',
      cod,
    });
  } catch (error) {
    console.error('🔥 Error inside createCOD:', error);
    res
      .status(500)
      .json({ message: 'Failed to create COD', error: error.message });
  }
};

// ✅ DELETE COD by ID
const deleteCOD = async (req, res) => {
  try {
    const deleted = await COD.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'COD entry not found' });
    }
    res.status(200).json({ message: 'COD entry deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting COD', error: err.message });
  }
};

// ✅ UPDATE COD by ID
const updateCOD = async (req, res) => {
  try {
    const updated = await COD.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) {
      return res.status(404).json({ message: 'COD entry not found' });
    }
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating COD', error: err.message });
  }
};

// ✅ GET COD by delivery ID
const getCODByDeliveryId = async (req, res) => {
  try {
    const { id } = req.params;
    const cod = await COD.findOne({ delivery: id });
    if (!cod)
      return res
        .status(404)
        .json({ message: 'COD not found for this delivery' });
    res.json(cod);
  } catch (err) {
    console.error('❌ Error fetching COD:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ GET all CODs
const getAllCOD = async (req, res) => {
  try {
    let { page = 1, perPage = 6, searchText = '' } = req.query;
    page = parseInt(page);
    perPage = parseInt(perPage);
    let query = {
      $and: [],
    };

    if (searchText) {
      const regex = new RegExp(searchText, 'i'); // case-insensitive search
      query.$and.push({
        $or: [
          { customerName: regex },
          { phoneNumber: regex },
          { address: regex },
          { 'car.make': regex },
          { 'car.model': regex },
        ],
      });
    }
    if (req.user.role === 'Sales') {
      query.$and.push({ salesperson: req.user.id });
    }
    const cods = await COD.find(query)
      .populate('salesperson', 'name phoneNumber email')
      .populate('driver', 'name phoneNumber')
      .populate('delivery', 'deliveryDate status')
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);
    const total = await COD.countDocuments(query);
    res.json({ cods, total });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Failed to fetch CODs', error: err.message });
  }
};

// ✅ EXPORT CONTROLLER
module.exports = {
  createCOD,
  deleteCOD,
  updateCOD,
  getCODByDeliveryId,
  getAllCOD,
};
