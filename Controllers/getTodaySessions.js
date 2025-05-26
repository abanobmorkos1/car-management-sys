const DriverHours = require('../Schema/DriverHour');
const moment = require('moment');

exports.getTodaySessions = async (req, res) => {
  const today = moment().format('YYYY-MM-DD');

  try {
    const query = {
      date: today
    };

    const sessions = await DriverHours.find(query)
      .populate('driver', 'name email') // Adjust based on your schema
      .sort({ clockIn: 1 });

    // Group by driver
    const grouped = {};

    sessions.forEach(session => {
      const id = session.driver._id;
      if (!grouped[id]) {
        grouped[id] = {
          driver: session.driver,
          totalHours: 0,
          sessions: []
        };
      }

      const hasClockOut = session.clockIn && session.clockOut;
      const calcHours = hasClockOut
        ? (new Date(session.clockOut) - new Date(session.clockIn)) / 3600000
        : 0;

      grouped[id].sessions.push({
        _id: session._id,
        clockIn: session.clockIn,
        clockOut: session.clockOut,
        totalHours: hasClockOut ? +calcHours.toFixed(2) : 0
      });

      if (hasClockOut) {
        grouped[id].totalHours += +calcHours;
      }
    });

    res.json(Object.values(grouped));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch today\'s sessions', error: err });
  }
};