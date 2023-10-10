const mongoose = require("mongoose");
const otherSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  pensionContributions: Boolean,
  contributionDetails: [
    {
      id: Number,
      year: Number,
      typeDetails: String,
      pension: Number,
      incomeProtection: Number,
    }
  ],
  currentStep:Number,
  isComplete:Boolean,
});
const OtherDetails = mongoose.model("OtherDetails", otherSchema);
module.exports = OtherDetails;
