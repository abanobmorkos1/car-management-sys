const mongoose = require('mongoose');

const salespersonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, required: true },
  phoneNumber: { type: Number, required: true },

}, { timestamps: true });

module.exports = mongoose.model('NewSalesperson', salespersonSchema);
