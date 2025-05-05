const DriverHour = require('../Schema/DriverHour');
const Upload = require('../Utils/uploads');
const getFriday = require('../Utils/weekUtils');

exports.clockIn = async (req, res) => {
  const now = new Date();
  const friday = getFriday(now);
  const end = new Date(friday);
  end.setDate(end.getDate() + 6);

  await DriverHour.create({
    driverId: req.user.id,
    clockIn: now,
    weekStart: friday,
    weekEnd: end
  });

  res.json({ message: 'Clocked in', clockIn: now });
};

exports.clockOut = async (req, res) => {
  const now = new Date();
  const entry = await DriverHour.findOne({ driverId: req.user.id, clockOut: null }).sort({ clockIn: -1 });
  if (!entry) return res.status(400).json({ error: 'No active clock-in found' });

  const total = Math.round(((now - entry.clockIn) / 3600000) * 100) / 100;
  entry.clockOut = now;
  entry.totalHours = total;
  await entry.save();

  res.json({ message: 'Clocked out', totalHours: total });
};

exports.getBonuses = async (req, res) => {
  const start = getFriday(new Date());
  const uploads = await Upload.find({
    driverId: req.user.id,
    dateUploaded: { $gte: start }
  });

  const reviewCount = uploads.filter(u => u.type === 'review').length;
  const customerCount = uploads.filter(u => u.type === 'customer').length;

  const total = reviewCount * 25 + customerCount * 5;
  res.json({ reviewCount, customerCount, total });
};

exports.uploadBonus = async (req, res) => {
    const { type } = req.body;
  
    if (!['review', 'customer'].includes(type)) {
      return res.status(400).json({ error: 'Invalid upload type' });
    }
  
    if (!req.file || !req.file.location) {
      return res.status(400).json({ error: 'No image uploaded' });
    }
  
    await Upload.create({
      driverId: req.user.id,
      type,
      imageUrl: req.file.location,
    });
  
    res.status(200).json({ message: 'Upload successful', url: req.file.location });
  };
  