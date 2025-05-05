const mongoose = require('mongoose');

const DriverHourSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clockIn: Date,
  clockOut: Date,
  totalHours: Number,
  weekStart: Date, // e.g. Friday
  weekEnd: Date    // Thursday
});

module.exports = mongoose.model('DriverHour', DriverHourSchema);
