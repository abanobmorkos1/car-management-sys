const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  address: { type: String, required: true },
  pickupFrom: { type: String, required: true }, // ✅ NEW FIELD
  salesperson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deliveryDate: { type: Date, required: true },
  codAmount: { type: Number, required: true },
  codCollected: { type: Boolean, default: false },
  codMethod: {
    type: String,
    enum: ['Cash', 'Zelle', 'Check', null],
    default: null
  },
  codCollectionDate: { type: Date },
  notes: { type: String },
  vin: { type: String },
  make: { type: String },
  model: { type: String },
  trim: { type: String },
  color: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Delivery', deliverySchema);
