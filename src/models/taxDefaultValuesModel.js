const mongoose = require("mongoose");

const taxRatesSchema = {
  over65ExemptionRatePercent: Number,
  lowerRatePercent: Number,
  marginalRatePercent: Number,
};

const taxBandsSchema = {
  single: Number,
  singleParent: Number,
  married1Income: Number,
  married2Incomes: Number
};

const exemptionLimitsSchema = {
  single: Number,
  married: Number,
};

const taxCreditsSchema = {
  personalSingle: Number,
  married: Number,
  paye: Number,
  singleParent: Number,
  widowNoDependants: Number,
  widowCreditYearly: Number,
  ageCreditSingle: Number,
  ageCreditMarried: Number,
  homeCarer: Number,
  homeCarerEarningLimitsMin: Number,
  homeCarerEarningLimitsMax: Number,
  incapacitated: Number,
  dependentRelative: Number,
  dependantRelativeLimits: Number,
  rentPerPerson: Number,
  rentPerCouple: Number,
  maxPercentageOfRent: Number,
  collegeFees: {
    partTimeCourseDisregardedAmount: Number,
    fullTimeCourseDisregardedAmount: Number,
    courseMaximum: Number,
    percentageAllowable: Number,
  },
  allowableHealthExpenses: Number,
  medicalInsurance: {
    maxPerAdult: Number,
    maxPerChild: Number,
  },
  pension: Number,
  incomeProtection: Number,
  workFromHome: Number,
};

const uscRatesSchema = {
  uscRatesPercentage: [Number],
  medicalCardExemptionTopRate: Number,
  uscBands: [Number],
};

const taxSchema = new mongoose.Schema({
  year: Number,
  taxRates: taxRatesSchema,
  taxBands: taxBandsSchema,
  exemptionLimitsOver65: exemptionLimitsSchema,
  taxCredits: taxCreditsSchema,
  uscRatesBands: uscRatesSchema,
});

const TaxDefaultValues = mongoose.model("TaxDefaultValues", taxSchema);

module.exports = TaxDefaultValues;
