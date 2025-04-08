const mongoose = require('mongoose');
const { Schema } = mongoose;


const carSchema = new Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  salespersonId: { type: Schema.Types.ObjectId, ref: 'Salesperson', required: true },
  driver: { type: String, required: true },
  pickedDate: { type: Date, default: Date.now },
  damageReport: { type: String, default: 'No report' }, // Default text
  pictureUrls: [{ type: String }], // Support for multiple pictures
  videoUrl: { type: String },      // Single video
}, { timestamps: true });

module.exports = mongoose.model('Car', carSchema);

