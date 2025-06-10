const DriverHours = require('../Schema/DriverHour');
const Delivery = require('../Schema/deliveries');

exports.overrideHours = async (req, res) => {
  const { id: userId, role } = req.user;
  const { id } = req.params;
  const { totalHours } = req.body;

  if (!['Management', 'owner'].includes(role)) {
    return res.status(403).json({
      message: 'Unauthorized: Only managers or owners can override hours',
    });
  }

  try {
    const updated = await DriverHours.findByIdAndUpdate(
      id,
      {
        totalHours: parseFloat(totalHours),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json({ message: 'Override successful', updated });
  } catch (err) {
    res.status(500).json({ message: 'Override failed', error: err });
  }
};

exports.getPendingClockIns = async (req, res) => {
  try {
    const pending = await DriverHours.find({ status: 'pending' }).populate(
      'driver',
      'name'
    );
    res.json(pending);
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Failed to fetch pending requests', error: err });
  }
};

exports.approveClockIn = async (req, res) => {
  try {
    const session = await DriverHours.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    res.json({ message: 'Clock-in approved', session });
  } catch (err) {
    res.status(500).json({ message: 'Failed to approve', error: err });
  }
};

exports.rejectClockIn = async (req, res) => {
  try {
    const session = await DriverHours.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    res.json({ message: 'Clock-in rejected', session });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reject', error: err });
  }
};

exports.getSessionsByDate = async (req, res) => {
  try {
    const { today, weekStart } = req.query;

    const sessions = await DriverHours.find({
      clockIn: {
        $gte: new Date(weekStart),
      },
      status: 'approved',
    }).populate('driver', 'name');

    const grouped = {};
    sessions.forEach((session) => {
      const driverId = session.driver._id.toString();
      if (!grouped[driverId]) {
        grouped[driverId] = {
          driver: session.driver,
          totalHours: 0,
          weeklyTotalHours: 0,
          sessions: [],
        };
      }

      const sessionHours = (session.duration || 0) / 60;

      grouped[driverId].weeklyTotalHours += sessionHours;

      if (session.date === today.split('T')[0]) {
        grouped[driverId].totalHours += sessionHours;
      }

      grouped[driverId].sessions.push(session);
    });

    Object.values(grouped).forEach((group) => {
      group.totalHours = group.totalHours.toFixed(2);
      group.weeklyTotalHours = group.weeklyTotalHours.toFixed(2);
      group.todaysDate = today;
      group.weekRange = weekStart;
      group.sessions.forEach((session) => {
        session.clockIn = session.clockIn.toISOString();
        session.clockOut = session.clockOut
          ? session.clockOut.toISOString()
          : null;
      });
    });

    res.json(Object.values(grouped));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch sessions', error: err });
  }
};

exports.getWeeklyEarnings = async (req, res) => {
  const { id: driverId } = req.user;
  const weekStart = getWeekStart(new Date());

  try {
    const sessions = await DriverHours.find({
      driver: driverId,
      weekStart,
      clockOut: { $exists: true },
    });

    const baseEarnings = sessions.reduce(
      (sum, s) => sum + (s.earnings || 0),
      0
    );

    const uploads = await Upload.find({ driver: driverId, weekStart }); // Make sure your Upload model has `weekStart`
    const bonus = uploads.reduce((sum, u) => {
      return sum + (u.type === 'review' ? 20 : u.type === 'customer' ? 5 : 0);
    }, 0);

    const total = baseEarnings + bonus;

    res.json({ base: baseEarnings, bonus, total });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Failed to fetch weekly earnings', error: err.message });
  }
};

exports.assignDriver = async (req, res) => {
  const { id: managerId, role } = req.user;
  const { id: deliveryId } = req.params;
  const { driverId } = req.body;

  if (!['Management', 'owner'].includes(role)) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  if (!driverId) {
    return res
      .status(400)
      .json({ message: 'Missing driverId in request body' });
  }

  try {
    const updated = await Delivery.findByIdAndUpdate(
      deliveryId,
      { driver: driverId },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    res.json({ message: 'Driver assigned successfully', updated });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Failed to assign driver', error: err.message });
  }
};
