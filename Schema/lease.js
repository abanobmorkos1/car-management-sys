const mongoose = require('mongoose');

const leaseSchema = new mongoose.Schema(
  {
    year: {
      type: Number,
      required: true,
      min: 1900,
      max: new Date().getFullYear(),
    },
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
    },
    bank: { type: String, required: true },
    customerName: { type: String, required: true },
    address: { type: String, required: true },
    salesPerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pickedDate: { type: Date, default: Date.now },
    damageReport: { type: String, default: 'No report' },
    hasTitle: { type: Boolean, default: false },
    titleKey: { type: String },
    leaseReturnMediaKeys: { type: [String], default: [] },
    documents: [
      {
        type: { type: String, required: true },
        url: { type: String, required: true },
        key: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    returnStatus: {
      type: String,
      enum: ['Ground', 'Buy', 'In Progress', 'Not Set'],
      default: 'Not Set',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    statusUpdatedAt: {
      type: Date,
    },
    groundingStatus: {
      type: String,
      enum: ['Ground', 'Grounded', 'Buy', 'In Progress', ''],
      default: '',
    },
    leftPlates: { type: Boolean, default: false },
    plateNumber: { type: String, default: '' },
    odometerDisclosure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OdometerDamageDisclosure',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LeaseReturns', leaseSchema);
