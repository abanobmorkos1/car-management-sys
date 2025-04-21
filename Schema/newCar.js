const mongoose = require('mongoose');
const { Schema } = mongoose;

const carSchema = new mongoose.Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  salesPersonid : { type: String, required: true },
  driver: { type: String, required: true },
  pickedDate: { type: Date, default: Date.now },
  damageReport: { type: String, default: 'No report' },
  pictureUrls: [{ type: String }],   // Car images
  videoUrl: { type: String },        // Car video
  driverIdPicture: { type: String }  // ✅ Optional driver's ID picture URL
}, { timestamps: true });

module.exports = mongoose.model('NewCar', carSchema);