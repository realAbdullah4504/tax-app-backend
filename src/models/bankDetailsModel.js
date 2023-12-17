const mongoose = require("mongoose");
const bankDetailsModel = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  accountTitle: String,
  iban: String,
  beneficiaryId: String,
  ppsn: String,

  submittedDate: Date,
  receivedDate: Date,

  totalReceivedBankAmount: Number,
  totalRefundAmount: Number,
  status: {
    type: String,
    default: "Cannot Initiate Payment",
  }
},
  {
    timestamps: true,
  }
);
const BankDetails = mongoose.model(
  "BankDetails",
  bankDetailsModel
);

module.exports = BankDetails;
