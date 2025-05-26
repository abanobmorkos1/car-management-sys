const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  
});

tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // auto delete

module.exports = mongoose.model('Token', tokenSchema);
