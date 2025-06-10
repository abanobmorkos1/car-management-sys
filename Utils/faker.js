const LeaseReturn = require('../Schema/lease');
/**
 * const mongoose = require('mongoose');
 
 const leaseSchema = new mongoose.Schema(
   {
     year: {
       type: Number,
       required: true,
       min: 1900,
       max: new Date().getFullYear(),
     },
     make: String,
     model: String,
     trim: String,
     bodyStyle: String,
     engine: String,
     fuelType: String,
     driveType: String,
     plant: String,
     doors: Number,
     transmission: String,
     miles: { type: Number, required: true },
     vin: {
       type: String,
       required: true,
     },
     bank: { type: String, required: true },
     customerName: { type: String, required: true },
     address: { type: String, required: true },
     salesPerson: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'User',
       required: true,
     },
     city: { type: String, required: true },
     state: { type: String, required: true },
     zip: { type: String, required: true },
     driver: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'User',
       required: true,
     },
     pickedDate: { type: Date, default: Date.now },
     damageReport: { type: String, default: 'No report' },
     hasTitle: { type: Boolean, default: false },
     titleKey: { type: String },
     odometerKey: { type: String, required: true },
     leaseReturnMediaKeys: { type: [String], default: [] },
     odometerStatementUrl: { type: String },
     odometerStatementKey: { type: String },
     documents: [
       {
         type: { type: String, required: true },
         url: { type: String, required: true },
         key: { type: String, required: true },
         uploadedAt: { type: Date, default: Date.now },
       },
     ],
     returnStatus: {
       type: String,
       enum: ['Ground', 'Buy', 'In Progress', 'Not Set'],
       default: 'Not Set',
     },
     updatedBy: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'User',
     },
     statusUpdatedAt: {
       type: Date,
     },
     groundingStatus: {
       type: String,
       enum: ['Ground', 'Buy', 'In Progress', ''],
       default: '',
     },
     leftPlates: { type: Boolean, default: false },
     plateNumber: { type: String, default: '' },
   },
   { timestamps: true }
 );
 
 module.exports = mongoose.model('LeaseReturns', leaseSchema);
 
 */
const main = async () => {
  const leases = await LeaseReturn.find({}).lean();
  let totalFake = 50;
  for (let i = 0; i < totalFake; i++) {
    let ramdomIndex = Math.floor(Math.random() * leases.length);
    let fakeLease = leases[ramdomIndex];
    fakeLease._id = undefined; // Reset _id for new document
    fakeLease.year = Math.floor(Math.random() * (2023 - 2000 + 1)) + 2000; // Random year between 2000 and 2023
    fakeLease.createdAt = new Date(
      Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 365)
    );
    fakeLease.updatedAt = new Date(
      Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 365)
    );
    fakeLease.groundingStatus = '';
    await LeaseReturn.create(fakeLease);
  }
  console.log(`✅ Created ${totalFake} fake lease returns`);
};
// main();
