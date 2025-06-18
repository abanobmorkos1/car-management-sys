const Delivery = require('../Schema/deliveries');
const mongoose = require('mongoose');
const COD = require('../Schema/cod');
const sendSMS = require('../Utils/sendSMS');
const User = require('../Schema/user');
const createDelivery = async (req, res) => {
  try {
    if (req.session?.user?.role === 'Sales') {
      req.body.salesperson = req.session.user.id;
    }
    const delivery = new Delivery(req.body);
    await delivery.save();
    res.status(201).json(delivery);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: 'Error saving delivery', error: err.message });
  }
};

const getAllDeliveries = async (req, res) => {
  try {
    let { start, end, page = 1, pageSize = 6, filter: __fi = '' } = req.query;
    page = parseInt(page);
    pageSize = parseInt(pageSize);
    let filter = {};
    if (start && end) {
      filter = {
        $or: [
          {
            deliveryDate: {
              $gte: new Date(start),
              $lt: new Date(end),
            },
          },
        ],
      };
    }
    if (__fi.toLowerCase() === 'assigned') {
      filter.driver = req.user.id;
    }
    const deliveries = await Delivery.find(filter)
      .populate('driver', '_id name phoneNumber')
      .populate('salesperson', 'name phoneNumber')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .sort({ deliveryDate: -1 });
    delete filter.driver;
    const total = await Delivery.countDocuments(filter);
    const assigned = await Delivery.countDocuments({
      ...filter,
      driver: req.user.id,
    });
    res.json({ deliveries, total, assigned });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch deliveries' });
  }
};
const updateDelivery = async (req, res) => {
  try {
    const deliveryId = req.params.id;
    const userId = req.session?.user?.id;
    const userRole = req.session?.user?.role;

    if (!userId || !userRole) {
      return res
        .status(401)
        .json({ message: 'Unauthorized - Missing user context' });
    }

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery)
      return res.status(404).json({ message: 'Delivery not found' });

    if (userRole === 'Driver' && delivery.driver?.toString() !== userId) {
      return res
        .status(403)
        .json({ message: 'Drivers can only update their assigned deliveries' });
    }
    if (userRole === 'Management' && !delivery.driver) {
      delivery.driver = userId;
    }

    const prevStatus = delivery.status;
    delivery.status = req.body.status;
    await delivery.save();

    if (req.body.status === 'Delivered' && prevStatus !== 'Delivered') {
      const codExists = await COD.findOne({ delivery: delivery._id });
      if (!codExists) {
        return res.status(200).json({
          message: 'Redirect to COD creation',
          redirect: `/driver/cod/from-delivery/${delivery._id}`,
        });
      }
    }

    res.status(200).json({ message: 'Status updated', delivery });
  } catch (err) {
    console.error('❌ Error updating delivery:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const editDeliveryDetails = async (req, res) => {
  try {
    const deliveryId = req.params.id;

    const originalDelivery =
      await Delivery.findById(deliveryId).populate('driver');
    if (!originalDelivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    const updatedDelivery = await Delivery.findByIdAndUpdate(
      deliveryId,
      req.body,
      { new: true }
    ).populate('driver');

    const managers = await User.find({ role: 'Management' }).select(
      'name phoneNumber'
    );

    const checkNumber = (phoneNumber) => {
      phoneNumber = phoneNumber.replace(/\D/g, '').replace(/^1/, '');
      phoneNumber = '+1' + phoneNumber;
      const phoneRegex = /^\+?1?\d{10}$/;
      return phoneRegex.test(phoneNumber);
    };

    const changes = [];
    if (originalDelivery.address !== updatedDelivery.address) {
      changes.push(`Address: ${updatedDelivery.address || 'N/A'}`);
    }
    if (
      originalDelivery.deliveryDate?.getTime() !==
      updatedDelivery.deliveryDate?.getTime()
    ) {
      changes.push(
        `Delivery time: ${new Date(
          updatedDelivery.deliveryDate
        ).toLocaleString()}`
      );
    }
    if (originalDelivery.customerName !== updatedDelivery.customerName) {
      changes.push(`Customer: ${updatedDelivery.customerName}`);
    }
    if (originalDelivery.customerPhone !== updatedDelivery.customerPhone) {
      changes.push(`Customer phone: ${updatedDelivery.customerPhone}`);
    }
    if (originalDelivery.vehicleDetails !== updatedDelivery.vehicleDetails) {
      changes.push(`Vehicle: ${updatedDelivery.vehicleDetails}`);
    }
    if (originalDelivery.dealershipName !== updatedDelivery.dealershipName) {
      changes.push(`Dealership: ${updatedDelivery.dealershipName}`);
    }
    if (originalDelivery.codAmount !== updatedDelivery.codAmount) {
      changes.push(`COD amount: $${updatedDelivery.codAmount || 0}`);
    }

    if (changes.length > 0) {
      const changesText = changes.join(', ');
      if (updatedDelivery.driver?.phoneNumber) {
        if (checkNumber(updatedDelivery.driver.phoneNumber)) {
          await sendSMS(
            updatedDelivery.driver.phoneNumber,
            `DriveFast: Delivery for ${updatedDelivery.customerName} updated. Changes: ${changesText}. Reply STOP to opt out.`
          );
        }
      }
      for (const manager of managers) {
        if (checkNumber(manager.phoneNumber)) {
          await sendSMS(
            manager.phoneNumber,
            `DriveFast: Delivery for ${updatedDelivery.customerName} updated by ${req.session.user.name}. Changes: ${changesText}. Reply STOP to opt out.`
          );
        }
      }
    }

    res.status(200).json(updatedDelivery);
  } catch (err) {
    console.error(' Error updating delivery:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteDelivery = async (req, res) => {
  try {
    const deleted = await Delivery.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: 'Delivery not found' });
    res.status(200).json({ message: 'Delivery deleted successfully' });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error deleting delivery', error: err.message });
  }
};

const assignDriver = async (req, res) => {
  const { id } = req.params;
  const { driverId } = req.body;

  if (!driverId)
    return res.status(400).json({ message: 'Driver ID is required' });
  if (!mongoose.Types.ObjectId.isValid(driverId))
    return res.status(400).json({ message: 'Invalid driver ID format' });

  try {
    const updated = await Delivery.findByIdAndUpdate(
      id,
      { driver: new mongoose.Types.ObjectId(driverId) },
      { new: true }
    ).populate('driver', '_id name');

    if (!updated)
      return res.status(404).json({ message: 'Delivery not found' });
    res
      .status(200)
      .json({ message: 'Driver assigned successfully', delivery: updated });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Failed to assign driver', error: err.message });
  }
};

const codChartData = async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res
        .status(400)
        .json({ message: 'Start and end dates are required' });
    }
    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    const deliveries = await Delivery.find({
      deliveryDate: { $gte: startDate, $lte: endDate },
      status: 'Delivered',
      codAmount: { $exists: true, $ne: null, $gt: 0 },
    }).select('deliveryDate codAmount paymentMethod');

    const totalCODCollected = deliveries.reduce(
      (sum, delivery) => sum + (delivery.codAmount || 0),
      0
    );
    const totalCollections = deliveries.length;
    const averageCODAmount =
      totalCollections > 0 ? totalCODCollected / totalCollections : 0;

    const totalDeliveries = await Delivery.countDocuments({
      deliveryDate: { $gte: startDate, $lte: endDate },
      status: 'Delivered',
    });
    const collectionRate =
      totalDeliveries > 0 ? (totalCollections / totalDeliveries) * 100 : 0;

    const dailyCollections = [];
    const dateMap = new Map();

    deliveries.forEach((delivery) => {
      const dateKey = new Date(delivery.deliveryDate)
        .toISOString()
        .split('T')[0];
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, {
          totalAmount: 0,
          count: 0,
          date: new Date(dateKey),
        });
      }
      const dayData = dateMap.get(dateKey);
      dayData.totalAmount += delivery.codAmount;
      dayData.count += 1;
    });

    dateMap.forEach((data, dateKey) => {
      dailyCollections.push({
        date: data.date.toISOString(),
        totalAmount: Math.round(data.totalAmount * 100) / 100,
        count: data.count,
        averageAmount: Math.round((data.totalAmount / data.count) * 100) / 100,
      });
    });

    dailyCollections.sort((a, b) => new Date(a.date) - new Date(b.date));

    const paymentMethodMap = new Map();
    deliveries.forEach((delivery) => {
      const method = delivery.paymentMethod || 'Cash';
      if (!paymentMethodMap.has(method)) {
        paymentMethodMap.set(method, { totalAmount: 0, count: 0 });
      }
      const methodData = paymentMethodMap.get(method);
      methodData.totalAmount += delivery.codAmount;
      methodData.count += 1;
    });

    const paymentMethods = [];
    paymentMethodMap.forEach((data, method) => {
      const percentage =
        totalCODCollected > 0
          ? (data.totalAmount / totalCODCollected) * 100
          : 0;
      paymentMethods.push({
        method,
        totalAmount: Math.round(data.totalAmount * 100) / 100,
        count: data.count,
        percentage: Math.round(percentage * 100) / 100,
      });
    });

    const response = {
      summary: {
        totalCODCollected: Math.round(totalCODCollected * 100) / 100,
        totalCollections,
        averageCODAmount: Math.round(averageCODAmount * 100) / 100,
        collectionRate: Math.round(collectionRate * 100) / 100,
      },
      dailyCollections,
      paymentMethods,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
    };

    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch COD chart data' });
  }
};

const dealerShips = async (req, res) => {
  try {
    const searchText = req.query.q || '';
    const dealerships = await Delivery.distinct('dealershipName', {
      dealershipName: { $regex: searchText, $options: 'i' },
    });
    res.status(200).json(dealerships);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch dealerships' });
  }
};

const getDeliveryByVin = async (req, res) => {
  try {
    const { vin } = req.query;
    if (!vin) {
      return res.status(400).json({ message: 'VIN is required' });
    }
    const delivery = await Delivery.findOne({ vin });
    if (!delivery) {
      return res
        .status(404)
        .json({ message: 'Delivery not found for this VIN' });
    }
    res.status(200).json(delivery);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
module.exports = {
  createDelivery,
  getAllDeliveries,
  updateDelivery,
  editDeliveryDetails,
  deleteDelivery,
  assignDriver,
  codChartData,
  dealerShips,
  getDeliveryByVin,
};
