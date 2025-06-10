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
              $lte: new Date(end),
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
    delete filter.driver; // Remove driver from filter to avoid counting it in total
    const total = await Delivery.countDocuments(filter);
    const assigned = await Delivery.countDocuments({
      ...filter,
      driver: req.user.id,
    });
    res.json({ deliveries, total, assigned });
  } catch (err) {
    console.error('❌ Error fetching deliveries:', err);
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

    // ❌ If user is a driver and NOT assigned to this delivery, reject
    if (userRole === 'Driver' && delivery.driver?.toString() !== userId) {
      return res
        .status(403)
        .json({ message: 'Drivers can only update their assigned deliveries' });
    }

    // ✅ Managers can assign themselves if no driver is set
    if (userRole === 'Management' && !delivery.driver) {
      delivery.driver = userId;
    }

    // ✅ Now update the status
    const prevStatus = delivery.status;
    delivery.status = req.body.status;
    await delivery.save();

    // ✅ If status is 'Delivered' → redirect to COD creation (if not already exists)
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

    const updatedDelivery = await Delivery.findByIdAndUpdate(
      deliveryId,
      req.body,
      { new: true }
    ).populate('driver'); // 👈 Ensure driver info is available
    const managers = await User.find({ role: 'Management' }).select(
      'name phoneNumber'
    );

    if (!updatedDelivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }
    const checkNumber = (phoneNumber) => {
      phoneNumber = phoneNumber.replace(/\D/g, '').replace(/^1/, '');
      phoneNumber = '+1' + phoneNumber;
      const phoneRegex = /^\+?1?\d{10}$/;
      return phoneRegex.test(phoneNumber);
    };
    if (updatedDelivery.driver?.phoneNumber) {
      if (checkNumber(updatedDelivery.driver.phoneNumber)) {
        await sendSMS(
          updatedDelivery.driver.phoneNumber,
          `DriveFast: Delivery for ${
            updatedDelivery.customerName
          } updated. New address: ${
            updatedDelivery.address || 'N/A'
          }. Delivery at ${new Date(
            updatedDelivery.deliveryDate
          ).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}. Reply STOP to opt out.`
        );
      }
    }
    //update the managers about the delivery update
    for (const manager of managers) {
      if (checkNumber(manager.phoneNumber)) {
        await sendSMS(
          manager.phoneNumber,
          `DriveFast: Delivery for ${updatedDelivery.customerName} updated by ${
            req.session.user.name
          }. New address: ${
            updatedDelivery.address || 'N/A'
          }. Delivery at ${new Date(
            updatedDelivery.deliveryDate
          ).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}. Reply STOP to opt out.`
        );
      }
    }

    res.status(200).json(updatedDelivery);
  } catch (err) {
    console.error(' Error updating delivery:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Delete Delivery
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

// ✅ Assign Driver
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
    console.error('❌ Error during driver assignment:', err);
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
    endDate.setHours(23, 59, 59, 999); // Set end date to end of the day

    // Get deliveries with COD data within date range
    const deliveries = await Delivery.find({
      deliveryDate: { $gte: startDate, $lte: endDate },
      status: 'Delivered',
      codAmount: { $exists: true, $ne: null, $gt: 0 },
    }).select('deliveryDate codAmount paymentMethod');

    // Calculate summary statistics
    const totalCODCollected = deliveries.reduce(
      (sum, delivery) => sum + (delivery.codAmount || 0),
      0
    );
    const totalCollections = deliveries.length;
    const averageCODAmount =
      totalCollections > 0 ? totalCODCollected / totalCollections : 0;

    // Get total deliveries for collection rate
    const totalDeliveries = await Delivery.countDocuments({
      deliveryDate: { $gte: startDate, $lte: endDate },
      status: 'Delivered',
    });
    const collectionRate =
      totalDeliveries > 0 ? (totalCollections / totalDeliveries) * 100 : 0;

    // Group by date for daily collections
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

    // Sort by date
    dailyCollections.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Group by payment method
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
    console.error('❌ Error fetching COD chart data:', err);
    res.status(500).json({ message: 'Failed to fetch COD chart data' });
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
};
