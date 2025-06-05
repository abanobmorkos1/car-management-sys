const mongoose = require('mongoose');
const vinValidator = require('vin-validator');

const leaseSchema = new mongoose.Schema({
  year: { type: Number, required: true, min: 1900, max: new Date().getFullYear() },
  make: String,
  model: String,
  trim: String,
  bodyStyle: String,
  engine: String,
  fuelType: String,
  driveType: String,
  plant: String,
  doors: Number,
  transmission: String,
  miles: { type: Number, required: true },
  vin: {
    type: String,
    required: true,
    set: v => v.toUpperCase(),
    validate: {
      validator: v => vinValidator.validate(v),
      message: props => `${props.value} is not a valid VIN`
    }
  },
  bank: { type: String, required: true },
  customerName: { type: String, required: true },
  address: { type: String, required: true },
  salesPerson: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pickedDate: { type: Date, default: Date.now },
  damageReport: { type: String, required: true },
  hasTitle: { type: Boolean, default: false },
  titleKey: { type: String },
  odometerKey: { type: String , required: true},
  leaseReturnMediaKeys: { type: [String], default: [] },
  odometerStatementUrl: { type: String },
  odometerStatementKey: { type: String },
  documents: [{
    type: { type: String, required: true },
    url: { type: String, required: true },
    key: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  }]
, returnStatus: {
  type: String,
  enum: ['Ground', 'Buy', 'In Progress', 'Not Set'],
  default: 'Not Set',
},
updatedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User'
},
statusUpdatedAt: {
  type: Date
},
groundingStatus: {
  type: String,
  enum: ['Ground', 'Buy', 'In Progress', ''],
  default: ''
},
}, { timestamps: true });

leaseSchema.methods.setPickupDate = function (pickedUpToday, customDate = null) {
  this.pickedDate = pickedUpToday ? new Date() : (customDate ? new Date(customDate) : null);
};

module.exports = mongoose.model('LeaseReturns', leaseSchema);