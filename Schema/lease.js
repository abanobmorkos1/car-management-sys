const mongoose = require('mongoose');

const leaseSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear(), 'Year cannot be in the future'],
  },
  make: { type: String, required: true },
  model: { type: String, required: true },
  miles: { type: Number, required: true },
  vin: { type: String, required: true },
  bank: { type: String, required: true },
  customerName: { type: String, required: true },
  address: { type: String, required: true },
  salesPerson: { type: String, required: true },
  driver: { type: String, required: true },
  pickedDate: { type: Date, default: Date.now },
  damageReport: { type: String, required: true },
  hasTitle: { type: Boolean, required: true, default: false },
  titlePicture: {
    type: String,
    required: [function () { return this.hasTitle; }, 'Title picture is required when hasTitle is true']
  },
}, { timestamps: true });

// Method to update pickedDate
leaseSchema.methods.setPickupDate = function(pickedUpToday, customDate = null) {
  if (pickedUpToday) {
    this.pickedDate = new Date();
  } else if (customDate) {
    this.pickedDate = new Date(customDate);
  } else {
    this.pickedDate = null;
  }
};

module.exports = mongoose.model('Lease', leaseSchema);
