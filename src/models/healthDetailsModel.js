const mongoose = require("mongoose");
const healthSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  fullGpMedicalCard: Boolean,
  spouseFullGpMedicalCard: Boolean,
  incurHealthExpenses: [String],
  incurHealthExpensesDetail: [{
      gpHospConsultant: Number,
      prescriptions: Number,
      nonRoutineDental: Number,
      careHomeCarer: Number,
      other: String,
      otherAmount: Number,
      year: String,
    }],
  spouseEmployerPays: Boolean,
  employerPaysDetails: [{
      amount: Number,
      adultsCovered: Number,
      childrenCovered: Number,
    },
  ],
});
const HealthDetails = mongoose.model("HealthDetails", healthSchema);
module.exports = HealthDetails;
