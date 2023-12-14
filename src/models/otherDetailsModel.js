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
      providerName:String,
      year: Number,
      typeDetails: String,
      pension: Number,
      incomeProtection: Number,
    }
  ],
  currentStep:Number,
  isComplete:Boolean,
},
{
  timestamps: true,
});
const OtherDetails = mongoose.model("OtherDetails", otherSchema);
module.exports = OtherDetails;
