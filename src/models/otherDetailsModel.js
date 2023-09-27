const mongoose = require("mongoose");
const otherSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
    },
    pensionContributions: Boolean,
    pension:Number,
    incomeProtection: Number,
  });
const OtherDetails = mongoose.model("OtherDetails", otherSchema);
module.exports = OtherDetails;