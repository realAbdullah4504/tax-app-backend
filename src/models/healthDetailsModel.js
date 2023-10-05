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
      id: Number,
      year: Number,
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
      id: Number,
      year: Number,
      amount: Number,
      adultsCovered: Number,
      childrenCovered: Number,
    },
  ],
  currentStep:Number,
  isComplete:Boolean
});
const HealthDetails = mongoose.model("HealthDetails", healthSchema);
module.exports = HealthDetails;
