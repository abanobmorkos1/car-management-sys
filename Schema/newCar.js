const mongoose = require('mongoose');
const { Schema } = mongoose;

const carSchema = new Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  salespersonId: { type: Schema.Types.ObjectId, ref: 'Salesperson', required: true },
  driver: { type: String, required: true },
  pickedDate: { type: Date, default: Date.now },
  damageReport: { type: String, required: true },
  pictureUrl: { type: String }, // URL to the car's picture
  videoUrl: { type: String },   // URL to the car's video
}, { timestamps: true });

module.exports = mongoose.model('Car', carSchema);
