const mongoose = require("mongoose");
const propertyDetail = {
  rtbNumber: String,
  rentPaid: Number,
  receivedRentSupport: Boolean,
  eircode: String,
  leaseStartDate: Date,
  type:String,
  year:Number,
};
const workFromHomeDetail = {
    daysWorkedFromHome: Number,
    totalCostOfLightingAndHeat: Number,
    costOfBroadband: Number,
    year:Number,
  };
const homeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  payRentYears:[Number],
  payRentDetails: [propertyDetail],
  workFromHomeYears:[Number],
  workFromHomeDetails:[workFromHomeDetail],
});
const HomeDetails = mongoose.model("HomeDetails", homeSchema);
module.exports = HomeDetails;
