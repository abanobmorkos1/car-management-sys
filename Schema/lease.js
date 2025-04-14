const mongoose = require('mongoose');
const vinValidator = require('vin-validator');

const leaseSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear(), 'Year cannot be in the future'],
  },
  make: { type: String},
  model: { type: String },
  trim: { type: String },
  bodyStyle: { type: String },
  engine: { type: String },
  fuelType: { type: String },
  driveType: { type: String },
  plant: { type: String },
  doors: { type: Number },
  transmission: { type: String },

  miles: { type: Number, required: true },
  vin: {
    type: String,
    required: true,
    set: v => v.toUpperCase(),
    validate: {
      validator: function (v) {
        return vinValidator.validate(v);
      },
      message: props => `${props.value} is not a valid VIN`
    }
  },
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

module.exports = mongoose.model('LeaseReturns', leaseSchema);
