const mongoose = require('mongoose');
const { Schema } = mongoose;

const carSchema = new Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  salesPerson: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pickedDate: { type: Date, default: Date.now },
  damageReport: { type: String, default: 'No report' },
  pictureUrls: [{ type: String }],
  videoUrl: { type: String },
  driverIdPicture: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('NewCar', carSchema);