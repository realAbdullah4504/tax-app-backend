const mongoose = require("mongoose");
const propertyDetail = {
  year: String,
  type: String,
  rtbNumber: String,
  rentPaid: Number,
  receivedRentSupport: Boolean,
  eircode: String,
  leaseStartDate: Date,
};
const workFromHomeDetail = {
  year: String,
  daysWorkedFromHome: Number,
  totalCostOfLightingAndHeat: Number,
  costOfBroadband: Number,
};
const homeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  payRentYears: [String],
  payRentDetails: [propertyDetail],
  workFromHomeYears: [String],
  workFromHomeDetails: [workFromHomeDetail],
});
const HomeDetails = mongoose.model("HomeDetails", homeSchema);
module.exports = HomeDetails;
