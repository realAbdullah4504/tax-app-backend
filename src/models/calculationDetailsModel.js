const mongoose = require("mongoose");

const calculationDetail = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  year:Number,
  grossIncomeUsc:Number,
  grossTaxableIncome:Number,
  taxPaid:Number,
  uscPaid:Number,
  taxPaidTotal:Number,
  exemptionLimitsOver65:Number,
  standardRateBand:Number,
  pension:Number, // totalPension
  incomeProtection:Number, // totalIncomeProtection
  workFromHome:Number, // totalPriceWorkedFromHome
  adjustedBand:Number,
  grossIncomeDue:Number, // netIncomeTaxDue
  personal:String,
  paye:Number, //totalPaye
  singleParent:Number, // singleParentStandardCredits
  flatRateExpense:String, //TBD is a default value 
  ageCredit:Number, // please set a hard code value for now
  widowTrail:Number,
  carer:Number, // carerCredit
  Incapacitation:Number, //incapacitatedChild
  elderlyRelative:Number, // totalElderlyRelativeCredit
  tuition:Number, //totalFeesCourses
  rent:Number, //totalRent
  workFromHomePer: Number, //miscWorkFromHome
  healthExpense:Number, //totalHealthExpenses
  medicalInsurance:Number, //medicalInsurance
  pensionCredits:Number, // pensionAdditionalCredits
  incomeProtectionCredits: Number, //incomeProtectionAdditionalCredits
  totalTaxCredit:Number,
  netIncomeTaxDue:Number,
  usc1:Number,
  usc2:Number,
  usc3:Number,
  usc4:Number,
  totalUsc:Number,
  netTaxDue:Number,
  taxResult:Number,
  priorRebates:Number,
  finalResult:Number //finalFigureForCustomer
},
{
    timestamps: true,
}
);
const CalculationDetail = mongoose.model("calculationDetail", calculationDetail);
module.exports = CalculationDetail;