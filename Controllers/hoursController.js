const DriverHours = require('../Schema/DriverHour');
const moment = require('moment');

const getWeekStart = (date) => {
  return moment(date).isoWeekday(5).startOf('day').toDate(); // Friday
};

exports.clockIn = async (req, res) => {
  const { id: driverId } = req.user;
  const weekStart = getWeekStart(new Date());

  try {
    // Check if there's an open session (no clockOut yet)
    const openSession = await DriverHours.findOne({
      driver: driverId,
      clockOut: { $exists: false }
    }).sort({ createdAt: -1 });

    if (openSession) {
      return res.status(400).json({ message: 'Already clocked in. Please clock out first.' });
    }

    const entry = new DriverHours({
      driver: driverId,
      date: moment().startOf('day').toDate(),
      clockIn: new Date(),
      weekStart
    });

    await entry.save();
    res.status(200).json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Clock in failed', error: err });
  }
};

exports.clockOut = async (req, res) => {
  const { id: driverId } = req.user;

  try {
    const entry = await DriverHours.findOne({
      driver: driverId,
      clockOut: { $exists: false }
    }).sort({ createdAt: -1 });

    if (!entry) {
      return res.status(400).json({ message: 'No active clock-in session found' });
    }

    entry.clockOut = new Date();
    const diffMs = entry.clockOut - entry.clockIn;
    entry.totalHours = +(diffMs / 1000 / 60 / 60).toFixed(2);
    await entry.save();

    res.status(200).json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Clock out failed', error: err });
  }
};

exports.getWeeklyHours = async (req, res) => {
  const { id: driverId } = req.user;
  const weekStart = getWeekStart(new Date());

  try {
    const entries = await DriverHours.find({ driver: driverId, weekStart });
    const total = entries.reduce((sum, e) => sum + (e.totalHours || 0), 0);
    res.json({ entries, total });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch hours', error: err });
  }
};


exports.getClockInStatus = async (req, res) => {
  const { id: driverId } = req.user;

  try {
    const entry = await DriverHours.findOne({
      driver: driverId,
      clockOut: { $exists: false }
    }).sort({ createdAt: -1 });

    if (!entry) {
      return res.json({ isClockedIn: false });
    }

    res.json({
      isClockedIn: true,
      clockIn: entry.clockIn
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch status', error: err });
  }
};

// controllers/hoursController.js
exports.overrideHours = async (req, res) => {
  const { id: userId, role } = req.user;
  const { id } = req.params;
  const { totalHours } = req.body;

  if (!['manager', 'owner'].includes(role)) {
    return res.status(403).json({ message: 'Unauthorized: Only managers or owners can override hours' });
  }

  try {
    const updated = await DriverHours.findByIdAndUpdate(id, {
      totalHours: parseFloat(totalHours)
    }, { new: true });

    if (!updated) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json({ message: 'Override successful', updated });
  } catch (err) {
    res.status(500).json({ message: 'Override failed', error: err });
  }
};
