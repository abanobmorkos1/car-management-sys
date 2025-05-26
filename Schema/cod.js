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

  contractPicture: { type: String }, // S3 key or URL
  checkPicture: { type: String },    // only used if method is Check

  salesperson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  car: {
    year: { type: String }, // ✅ String to match how you store it in Delivery
    make: { type: String },
    model: { type: String },
    trim: { type: String },
    color: { type: String }
  },

  delivery: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Delivery',
    required: true
  },

  dateCollected: { type: Date, default: Date.now },

  createdFromDelivery: { type: Boolean, default: false } // ✅ helps track how it was created
}, { timestamps: true });


module.exports = mongoose.model('COD', codSchema);
