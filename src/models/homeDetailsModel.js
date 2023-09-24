const mongoose = require("mongoose");
const propertyDetail = {
  rtbNumber: String,
  rentPaid: Number,
  receivedRentSupport: Boolean,
  eircode: String,
  leaseStartDate: Date,
};
const homeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  primaryResidence: Boolean,
  dependentCollegeChild: Boolean,
  rtbNumber: String,
  rentPaid: Number,
  receivedRentSupport: Boolean,
  eircode: String,
  leaseStartDate: Date,
  additionalProperties: [propertyDetail],
  daysWorkedFromHome: Number,
  totalCostOfLightingAndHeat: Number,
  costOfBroadband: Number,
});
const HomeDetails = mongoose.model("HomeDetails", homeSchema);
module.exports = HomeDetails;
