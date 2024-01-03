const mongoose = require("mongoose");
const bankDetailsModel = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    accountTitle: String,
    iban: String,
    beneficiaryId: String,
    ppsn: String,

    receivedDate: Date,

    totalReceivedBankAmount: Number,
    netRebate: Number,
    refundReceivedStatus:String,
    paymentStatus: {
      type: String,
      default: "Cannot Initiate Payment",
    },

  },
  {
    timestamps: true,
  }
);
const BankDetails = mongoose.model("BankDetails", bankDetailsModel);

module.exports = BankDetails;
