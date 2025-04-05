const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  salespersonId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: Number,
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Sale', saleSchema);