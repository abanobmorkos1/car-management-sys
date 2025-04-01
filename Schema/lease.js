  const mongoose = require('mongoose');

const leaseSchema = new mongoose.Schema({
  // carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' },
  // userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  year: { 
    type: Number, 
    required: true,
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear(), 'Year cannot be in the future']
  },
  make: { type: String, required: true },
  model: { type: String, required: true },
  miles: { type: Number, required: true },
  vin: { type: String, required: true },
  bank: { type: String, required: true },
  customerName: { type: String, required: true },
  address: { type: String, required: true },
  salesPerson: { type: String, required: true },
  driver: { type: String, required: true },
  pickedDate: { type: String, default: null },
  damageReport: { type: String, required: true },
  hasTitle: { type: Boolean, required: true, default: false },  // Add boolean for title
  titlePicture: { type: String, required: function() { return this.hasTitle; } },  // Conditional field for picture
});

// Function to update pickup date
leaseSchema.methods.setPickupDate = function(pickedUpToday, customDate = null) {
  if (pickedUpToday) {
    this.pickupDate = new Date(); // Set pickupDate to current date if picked up today
  } else if (customDate) {
    this.pickupDate = new Date(customDate);  // Set pickupDate to custom date if provided
  } else {
    this.pickupDate = null;  // Optional: Set to null if no date is provided
  }
};

module.exports = mongoose.model('Lease', leaseSchema);