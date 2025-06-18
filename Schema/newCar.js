const mongoose = require('mongoose');
const { Schema } = mongoose;

const carSchema = new Schema(
  {
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    salesPerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pickedDate: { type: Date, default: Date.now },
    damageReport: { type: String, default: 'No report' },
    pictureUrls: [{ type: String }],
    videoUrl: { type: String },
    trim: { type: String },
    vin: { type: String, required: true, unique: true },

    customerName: { type: String },
    customerPhone: { type: String },
    customerAddress: { type: String },
    carUploadDoc: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CarUploadDoc',
      required: false,
    },
    linkedDelivery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Delivery',
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('NewCar', carSchema);
