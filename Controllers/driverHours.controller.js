const DriverHours = require('../Schema/DriverHour');
const moment = require('moment');
const Upload = require('../Schema/BonusUpload');
const { getWeekStart } = require('../Utils/dateUtils');



exports.clockIn = async (req, res) => {
  const { id: driverId } = req.user;
  const weekStart = getWeekStart(new Date());

  try {
    const openSession = await DriverHours.findOne({
      driver: driverId,
      clockOut: { $exists: false }
    }).sort({ createdAt: -1 });

    if (openSession) {
      return res.status(400).json({ message: 'Already clocked in. Please clock out first.' });
    }

    const entry = new DriverHours({
      driver: driverId,
      date: moment().format('YYYY-MM-DD'),
      clockIn: new Date(),
      weekStart,
      status: 'approved' // fallback for direct clock-in
    });

    await entry.save();
    res.status(200).json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Clock in failed', error: err });
  }
};

exports.requestClockIn = async (req, res) => {
  const { id: driverId } = req.user;
  const weekStart = getWeekStart(new Date());

  try {
    const existing = await DriverHours.findOne({
      driver: driverId,
      clockOut: { $exists: false },
      status: 'pending'
    });

    if (existing) {
      return res.status(400).json({ message: 'Clock-in request already pending' });
    }

    const entry = new DriverHours({
      driver: driverId,
      date: moment().format('YYYY-MM-DD'),
      clockIn: new Date(),
      weekStart,
      status: 'pending'
    });

    await entry.save();
    res.status(201).json({ message: 'Clock-in request submitted', entry });
  } catch (err) {
    res.status(500).json({ message: 'Failed to request clock-in', error: err });
  }
};

exports.getClockInStatus = async (req, res) => {
  const { id: driverId } = req.user;

  try {
    const entry = await DriverHours.findOne({
      driver: driverId,
      clockOut: { $exists: false },
      status: 'approved' // ✅ Only active sessions that were approved
    }).sort({ createdAt: -1 });

    if (!entry) {
      return res.json({ isClockedIn: false });
    }

    res.json({
      isClockedIn: true,
      clockIn: entry.clockIn,
      status: entry.status
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch status', error: err });
  }
};


exports.clockOut = async (req, res) => {
  const { id: driverId } = req.user;

  try {
    // 🔍 Find the most recent open session
    const session = await DriverHours.findOne({
      driver: driverId,
      clockOut: { $exists: false }
    }).sort({ createdAt: -1 });

    // ❌ No active session
    if (!session) {
      return res.status(400).json({ message: 'No active clock-in session found.' });
    }

    // ❌ Don't allow clock-out if status is still pending
    if (session.status !== 'approved') {
      return res.status(403).json({
        message: `Cannot clock out. Your session is still '${session.status}'. Please wait for approval or contact management.`
      });
    }

    // ✅ Calculate duration
    const clockOutTime = new Date();
    const durationMinutes = Math.floor((clockOutTime - session.clockIn) / 60000);
    const durationHours = durationMinutes / 60;

    // 💰 Calculate earnings
    const hourlyRate = 17;
    const earnings = parseFloat((durationHours * hourlyRate).toFixed(2)); // e.g. 3.5 hours × $17 = $59.50

    // ⏱️ Save data
    session.clockOut = clockOutTime;
    session.duration = durationMinutes;
    session.earnings = earnings;

    await session.save();

    console.log(`🕒 Driver ${driverId} clocked out | Duration: ${durationMinutes} min | $${earnings} earned`);

    res.status(200).json({
      message: 'Successfully clocked out',
      clockIn: session.clockIn,
      clockOut: session.clockOut,
      durationMinutes,
      earnings
    });
  } catch (err) {
    console.error('❌ Clock-out failed:', err.message);
    res.status(500).json({ message: 'Clock-out failed', error: err.message });
  }
};

exports.getWeeklyEarnings = async (req, res) => {
  const { id: driverId, role } = req.user;
  const weekStart = getWeekStart(new Date());

  try {
    const filter = { weekStart };

    // If the user is a driver, only show their own data
    if (role === 'Driver') {
      filter.driver = driverId;
    }

    const sessions = await DriverHours.find(filter);
    const uploads = await Upload.find({
      driver: role === 'Driver' ? driverId : { $exists: true },
      createdAt: { $gte: weekStart }
    });

    const totalHours = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60;
    const baseEarnings = parseFloat((totalHours * 17).toFixed(2));

    const reviewPhotos = uploads.filter(u => u.type === 'review').length;
    const customerPhotos = uploads.filter(u => u.type === 'customer').length;
    const bonus = (reviewPhotos * 20) + (customerPhotos * 5);

    const total = parseFloat((baseEarnings + bonus).toFixed(2));

    res.json({
      totalHours: totalHours.toFixed(2),
      baseEarnings,
      bonus,
      reviewPhotos,
      customerPhotos,
      totalEarnings: total
    });
  } catch (err) {
    console.error('❌ Weekly earnings error:', err.message);
    res.status(500).json({ message: 'Failed to fetch weekly earnings', error: err.message });
  }
};
exports.getWeeklyBreakdown = async (req, res) => {
  const { id: driverId } = req.user;
  const weekStart = getWeekStart(new Date());

  try {
    const sessions = await DriverHours.find({
      driver: driverId,
      weekStart
    });

    const uploads = await Upload.find({
      driver: driverId,
      createdAt: { $gte: weekStart }
    });

    const dailyMap = {};

    // Aggregate session earnings by date
    for (const session of sessions) {
      const date = moment(session.date).format('YYYY-MM-DD');
      if (!dailyMap[date]) {
        dailyMap[date] = {
          date,
          totalMinutes: 0,
          baseEarnings: 0,
          reviewPhotos: 0,
          customerPhotos: 0,
          bonus: 0,
          totalEarnings: 0
        };
      }

      dailyMap[date].totalMinutes += session.duration || 0;
      dailyMap[date].baseEarnings += session.earnings || 0;
    }

    // Add bonus info by date
    for (const upload of uploads) {
      const date = moment(upload.createdAt).format('YYYY-MM-DD');
      if (!dailyMap[date]) {
        dailyMap[date] = {
          date,
          totalMinutes: 0,
          baseEarnings: 0,
          reviewPhotos: 0,
          customerPhotos: 0,
          bonus: 0,
          totalEarnings: 0
        };
      }

      if (upload.type === 'review') {
        dailyMap[date].reviewPhotos += 1;
        dailyMap[date].bonus += 20;
      }

      if (upload.type === 'customer') {
        dailyMap[date].customerPhotos += 1;
        dailyMap[date].bonus += 5;
      }
    }

    // Final totalEarnings per day
    const dailyBreakdown = Object.values(dailyMap).map(day => ({
      ...day,
      totalHours: +(day.totalMinutes / 60).toFixed(2),
      totalEarnings: +(day.baseEarnings + day.bonus).toFixed(2)
    }));

    res.status(200).json(dailyBreakdown);
  } catch (err) {
    console.error('❌ Weekly breakdown error:', err.message);
    res.status(500).json({ message: 'Failed to fetch weekly breakdown', error: err.message });
  }
};