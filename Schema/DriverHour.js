const mongoose = require('mongoose');

const driverHoursSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clockIn: {
    type: Date,
    required: true
  },
  clockOut: {
    type: Date
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  weekStart: {
    type: String // e.g. 2025-05-16 (Friday of the week)
  }
}, { timestamps: true });

module.exports = mongoose.model('DriverHours', driverHoursSchema);
