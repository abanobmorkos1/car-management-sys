const mongoose = require('mongoose');

const codSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  address: { type: String, required: true },
  amount: { type: Number, required: true },
  method: {
    type: String,
    enum: ['Cash', 'Zelle', 'Check'],
    required: true
  },
  dateCollected: { type: Date, default: Date.now },
  contractPicture: { type: String, required: true }, // URL to S3/Cloudinary
  checkPicture: { type: String } // Required only if method is 'Check'
}, { timestamps: true });

module.exports = mongoose.model('COD', codSchema);
