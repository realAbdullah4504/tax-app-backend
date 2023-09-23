const mongoose = require("mongoose");
const otherSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
    },
    pensionContributions: Number,
    incomeProtectionContributions: Number,
  });
const OtherDetails = mongoose.model("OtherDetails", otherSchema);
module.exports = OtherDetails;