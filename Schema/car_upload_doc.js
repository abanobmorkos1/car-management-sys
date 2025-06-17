const mongoose = require('mongoose');

const carUploadDocSchema = new mongoose.Schema(
  {
    nameOfConsumer: { type: String, default: '' },
    addressOfConsumer: { type: String, default: 'N/A' },
    leaseOrPurchase: { type: String, enum: ['lease', 'purchase', ''] },
    make: { type: String, default: 'N/A' },
    model: { type: String, default: 'N/A' },
    year: { type: String, default: 'N/A' },
    vin: { type: String, default: 'N/A' },
    customOptions: { type: String, default: 'N/A' },
    modificationFacility: { type: String, default: 'N/A' },
    automobilePurchasedFrom: { type: String, default: 'N/A' },
    priceOfVehicle: { type: String, default: 'N/A' },
    estimatedPrice: { type: String, default: 'N/A' },
    estimatedDeliveryDate: { type: String, default: 'N/A' },
    placeOfDelivery: { type: String, default: 'N/A' },
    consumerSignature: { type: String, default: 'N/A' },
    signatureDate: { type: String, default: 'N/A' },
    carId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NewCar',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CarUploadDoc', carUploadDocSchema);
