const mongoose = require("mongoose");
const summary = {
  date_of_leaving: Date || null,
  employee_prsi_paid: Number,
  employer_pension_provider_name: String,
  employer_pension_provider_no: String,
  employer_prsi_paid: Number,
  employment_id: String,
  gross_pay: Number,
  income_tax_paid: Number,
  lpt_deducted: Number,
  pay_for_income_tax: Number,
  pay_for_usc: Number,
  ppsn: String,
  summary_type: String,
  start_date: Date,
  taxable_benefits: Number,
  usc_paid: Number,
  year: Number,
};
const employmentSummary = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  year:Number,
  summaryDetails: [summary],
});
const EmploymentSummary = mongoose.model("EmploymentSummary", employmentSummary);
module.exports = EmploymentSummary;
