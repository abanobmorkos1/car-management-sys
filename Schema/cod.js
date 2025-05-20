const mongoose = require('mongoose');

const codSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  address: { type: String, required: true },
  amount: { type: Number, default: 0 }, // allow zero if no COD collected
  method: {
  type: String,
  enum: ['Cash', 'Zelle', 'Check', 'None'],
  default: 'None',
  required: function () {
    return this.amount > 0;
  }
},
  contractPicture: { type: String }, // not required anymore
  checkPicture: { type: String },

  salesperson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // reference User schema
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // reference User schema
    required: true
  },
  car: {
    year: { type: Number },
    make: { type: String },
    model: { type: String },
  },

  dateCollected: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('COD', codSchema);
