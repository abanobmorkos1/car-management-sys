const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  address: { type: String, required: true },
  salesperson: { type: String, required: true },
  deliveryDate: { type: Date, required: true },
  codAmount: { type: Number, required: true },
  codCollected: { type: Boolean, default: false },
  codMethod: {
    type: String,
    enum: ['Cash', 'Zelle', 'Check', null],
    default: null
  },
  codCollectionDate: { type: Date }, // 👈 NEW FIELD
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Delivery', deliverySchema);