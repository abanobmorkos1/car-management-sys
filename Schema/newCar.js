const mongoose = require('mongoose');

const carSchema = new Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  // Add other fields like windowSticker, damageReport, etc.
  salespersonId: { type: Schema.Types.ObjectId, ref: 'Salesperson', required: true },
  driver: { type: String, required: true },
  pickedDate: { type: Date, default: Date.now },
  damageReport: { type: String, required: true },
  hasTitle: { type: Boolean, required: true, default: false },
  titlePicture: { type: String, required: function() { return this.hasTitle; } },
}, { timestamps: true });

module.exports = mongoose.model('newCar', newCarschema);