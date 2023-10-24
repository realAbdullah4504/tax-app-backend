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
const p21 = {
  combined_total: String,
  final_result_amount: String,
  self_refund_five: String,
  self_refund_four: String,
  self_refund_three: String,
  self_refund_two: String,
  self_refund_one: String,
  spouse_refund_five: String,
  spouse_refund_four: String,
  spouse_refund_three: String,
  spouse_refund_two: String,
  spouse_refund_one: String,
  year: String,
};
const employmentSummary = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  year: Number,
  summaryDetails: [summary],
  p21Details: p21,
});
const EmploymentSummary = mongoose.model("EmploymentSummary", employmentSummary);
module.exports = EmploymentSummary;
