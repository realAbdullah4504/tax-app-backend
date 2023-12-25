const mongoose = require("mongoose");
const bankDefaultValues = new mongoose.Schema(
  {
    errorBand: Number,
    returnDifference: Number,
    threshold: Number,
    VAT: Number,
    customerOfferCodes: [
      {
        customerOfferCode: String,
        value: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);
const BankDefaultValues = mongoose.model("BankDefaultValues", bankDefaultValues);

module.exports = BankDefaultValues;
