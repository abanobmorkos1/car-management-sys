const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: { type: String, required: true },
    pickupFrom: { type: String, required: true },
    salesperson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    deliveryDate: { type: Date, required: true },
    codAmount: { type: Number, required: true },
    codCollected: { type: Boolean, default: false },
    codMethod: {
      type: String,
      enum: ['Cash', 'Zelle', 'Check', null],
      default: null,
    },
    codCollectionDate: { type: Date },
    notes: { type: String },
    vin: { type: String },
    make: { type: String },
    model: { type: String },
    trim: { type: String },
    color: { type: String },
    year: { type: String },
    leaseReturn: {
      willReturn: { type: Boolean, default: false },
      carYear: { type: String },
      carMake: { type: String },
      carModel: { type: String },
    },

    status: {
      type: String,
      enum: [
        'In Route for Pick Up',
        'Waiting for Paperwork',
        'Heading to Customer',
        'Delivered',
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Delivery', deliverySchema);
