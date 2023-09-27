const mongoose = require("mongoose");
const healthSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  fullGpMedicalCard: Boolean,
  spouseFullGpMedicalCard: Boolean,
  incurHealthExpenses: [String],
  incurHealthExpensesDetail: [
    {
      year: String,
      gpHospConsultant: Number,
      prescriptions: Number,
      careHomeCarer: Number,
      other: String,
      otherAmount: Number,
    },
  ],
  spouseEmployerPays: Boolean,
  employerPaysDetails: [
    {
      year: String,
      amount: Number,
      adultsCovered: Number,
      childrenCovered: Number,
    },
  ],
});
const HealthDetails = mongoose.model("HealthDetails", healthSchema);
module.exports = HealthDetails;
