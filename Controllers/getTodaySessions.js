const DriverHours = require('../Schema/DriverHour');
const moment = require('moment');

// Get all clock-in/out sessions for today
exports.getTodaySessions = async (req, res) => {
  const todayStart = moment().startOf('day').toDate();
  const todayEnd = moment().endOf('day').toDate();

  try {
    // Optionally filter by driver ID if provided (for future use)
    const query = {
      date: { $gte: todayStart, $lte: todayEnd }
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

      grouped[id].sessions.push({
        clockIn: session.clockIn,
        clockOut: session.clockOut,
        totalHours: session.totalHours || 0
      });

      grouped[id].totalHours += session.totalHours || 0;
    });

    res.json(Object.values(grouped));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch today\'s sessions', error: err });
  }
};
