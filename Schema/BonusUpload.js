const mongoose = require('mongoose');

const BonusUploadSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['review', 'customer'],
    required: true,
  },
  key: { type: String, required: true },

  dateUploaded: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('BonusUpload', BonusUploadSchema);
