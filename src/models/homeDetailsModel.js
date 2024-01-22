const mongoose = require('mongoose');
const propertyDetail = {
  id: Number,
  year: Number,
  propertyType: String,
  landLordGovtOfficial: Boolean,
  agentLandlordName: String,
  rtbNumber: String,
  rentPaid: Number,
  receivedRentSupport: Boolean,
  addressLineOne: String,
  eircode: String,
  leaseStartDate: Date,
};
const workFromHomeDetail = {
  id: Number,
  year: Number,
  daysWorkedFromHome: Number,
  totalCostOfLightingAndHeat: Number,
  costOfBroadband: Number,
};
const homeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    payRentYears: [Number],
    payRentDetails: [propertyDetail],
    workFromHomeYears: [Number],
    workFromHomeDetails: [workFromHomeDetail],
    currentStep: Number,
    isComplete: Boolean,
  },
  {
    timestamps: true,
  }
);
const HomeDetails = mongoose.model('HomeDetails', homeSchema);
module.exports = HomeDetails;
