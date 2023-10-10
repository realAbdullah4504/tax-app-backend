const sendAppResponse = require("../utils/helper/appResponse");
// const AppError = require('../errors/AppError');
const TaxDefaultValues = require("../models/taxDefaultValuesModel");
const PersonalInfo = require("../models/personalDetailsModel");
const OtherDetails = require("../models/otherDetailsModel");
const HomeDetails = require("../models/homeDetailsModel");
const FamilyDetails = require("../models/familyDetailsModel");
const HealthDetails = require("../models/healthDetailsModel");

const calculate = async (year, userId, type) => {
  //get the tax values and age

  const {
    exemptionLimitsOver65,
    taxBands,
    taxRates: {
      over65ExemptionRatePercent,
      lowerRatePercent,
      marginalRatePercent,
    },
    taxCredits: {
      personalSingle,
      widowNoDependants,
      widowCredityears,
      widowTrail,
      married,
      paye,
      singleParent,
      incapacitated,

      dependentRelative,
      dependantRelativeLimits,

      collegeFees: {
        partTimeCourseDisregardedAmount,
        fullTimeCourseDisregardedAmount,
        courseMaximum,
        percentageAllowable,
      },
      rentPerPerson,
      rentPerCouple,
      maxPercentageOfRent,
      allowableHealthExpenses,
      medicalInsurance: { maxPerAdult, maxPerChild },
    },
    uscRatesBands: {
      uscRatesPercentage,
      uscBands,
      medicalCardExemptionTopRate,
    },
  } = await TaxDefaultValues.findOne({ year });
  const { dateOfBirth, maritalStatus, spousePassDate } =
    await PersonalInfo.findOne({ userId });
  const { contributionDetails } = await OtherDetails.findOne({ userId });
  const { workFromHomeDetails, payRentDetails } = await HomeDetails.findOne({
    userId,
  });
  const {
    incapacitatedChildren,
    incapacitatedChildrenDetails,
    elderlyRelativeCare,
    elderlyRelative,

    tuitionFeesCredit,
    students,
  } = await FamilyDetails.findOne({ userId });

  const {
    incurHealthExpensesDetail,
    spouseEmployerPays,
    employerPaysDetails,
    fullGpMedicalCard,
  } = await HealthDetails.findOne({ userId });

  //calculations for pension related to year and the personal and spouse
  const selectedPension = contributionDetails.filter(
    (item) => item.year === year
  );
  const totalPension = selectedPension.reduce((a, b) => a + b.pension, 0);
  const totalIncomeProtection = selectedPension.reduce(
    (a, b) => a + b.incomeProtection,
    0
  );
  //calculation for work from home related to year
  const { daysWorkedFromHome, totalCostOfLightingAndHeat, costOfBroadband } =
    workFromHomeDetails.find((item) => item.year === year);

  // Get the year of birth from the date
  const birthYear = dateOfBirth.getUTCFullYear();
  const currentYear = new Date().getUTCFullYear();
  const age = currentYear - birthYear;

  //for single
  const grossIncomeUsc = 100000;
  const grossTaxableIncome = 100000;
  const taxPaid = 25240;
  const uscPaid = 4839;

  //for single parent
  // const grossIncomeUsc = 100000;
  // const grossTaxableIncome = 90000;
  // const taxPaid = 22790;
  // const uscPaid = 4839;

  //for Married 1 Incomes
  // const grossIncomeUsc = 100000+50000;
  // const grossTaxableIncome = 90000 + 45000;
  // const taxPaid = 32480;
  // const uscPaid = 6152;

  let over65Exemption = 0;
  let standardRateBand = 0;
  let over65Percent = 0;

  //***********************************SECTION 1 *************************************************** */

  if (age > 65) {
    const exemption =
      type === "single" || type === "singleParent"
        ? exemptionLimitsOver65[type]
        : exemptionLimitsOver65["married"];
    over65Exemption = Math.min(grossTaxableIncome, exemption);
    over65Percent = over65ExemptionRatePercent / 100; //=IF(A15=">65",0,'Questions for App'!F105)
    console.log("exemption", exemption);
  } else {
    const band =
      type === "single" || type === "singleParent"
        ? taxBands[type]
        : taxBands["self"] + taxBands[type]["spouse"];
    // console.log(taxBands[type]);
    standardRateBand = band;
    over65Percent = lowerRatePercent / 100;
    console.log("band", band);
  }

  // console.log(standardRateBand, over65Exemption);
  // console.log(totalPension, totalIncomeProtection);
  // console.log(totalPriceWorkedFromHome);
  // console.log(over65Percent,marginalRatePercent);

  const taxPaidTotal = taxPaid + uscPaid; //=SUM(D10:D11)

  //=IF(A15=">65",MIN('Questions for App'!F113,'Calculations for App'!D9),0) + =IF(A15=">65",0,'Questions for App'!F108) +
  // ='Questions for App'!G85  + ='Questions for App'!G86 + ='Questions for App'!G70

  const totalPriceWorkedFromHome =
    (daysWorkedFromHome / 365) * (totalCostOfLightingAndHeat + costOfBroadband);
  console.log("totalPriceWorkedFromHome", totalPriceWorkedFromHome);

  const adjustedBand =
    over65Exemption +
    standardRateBand +
    totalPension +
    totalIncomeProtection +
    totalPriceWorkedFromHome; //=SUM(D15:D19)
  console.log("adjustedBand", adjustedBand);

  const grossIncome1 =
    Math.min(grossTaxableIncome, adjustedBand) * over65Percent; //=MIN(D20,D9)
  let grossIncome2 = 0;
  if (grossTaxableIncome - adjustedBand > 0) {
    grossIncome2 =
      (grossTaxableIncome - adjustedBand) * (marginalRatePercent / 100); //=IF(D9-D21>0,D9-D21,0)
  }
  const totalGrossIncome = grossIncome1 + grossIncome2; //=(D21*C21)+(D22*C22)
  console.log("totalGrossIncome", totalGrossIncome);

  //***********************************SECTION 2 *************************************************** */
  //Standard Credits
  // console.log(spousePassDate);
  totalYearsPassedSpouse = year - spousePassDate.getUTCFullYear();
  const widow =
    widowNoDependants + widowCredityears - (totalYearsPassedSpouse - 1) * 450;
  // console.log(

  //   spousePassDate.getUTCFullYear(),
  //   year,
  //   totalYearsPassedSpouse,
  //   widow
  // );
  console.log("widow", widow);

  let personal =
    type === "single" || type === "singleParent"
      ? maritalStatus === "Widowed"
        ? widow
        : personalSingle
      : married["self"] + married["spouse"]; //=IF('Questions for App'!E15="Widowed",'Questions for App'!F120,'Questions for App'!F116)

  console.log("personal", personal);

  const totalPaye = type !== "married1Income" ? paye : paye + paye;
  console.log("totalPaye", totalPaye);

  const standardCredits =
    personal + totalPaye + (type === "singleParent" && singleParent); //we have taken paye for one only
  console.log("standardCredits", standardCredits);

  //***********************************SECTION 3 *************************************************** */
  //Additional Credits
  //age cresit is not defined
  // console.log(widowTrail);
  let widowTrail1 =
    (type === "single" || type === "singleParent") &&
    maritalStatus === "Widowed" &&
    widowTrail; //formula should be understand from questions app
  let incapacitatedChild =
    incapacitatedChildren &&
    incapacitated * incapacitatedChildrenDetails.length; //years should be mentioned

  console.log("widowTrail1", widowTrail1);
  console.log("incapacitatedChild", incapacitatedChild);
  // console.log(incapacitatedChild);

  let totalElderlyRelativeCredit = 0; //years should be mentioned
  if (elderlyRelativeCare) {
    elderlyRelative.forEach(({ annualIncome }) => {
      if (annualIncome <= dependantRelativeLimits) {
        totalElderlyRelativeCredit += dependentRelative;
      } else totalElderlyRelativeCredit += 0;
    });
  }
  console.log("totalElderlyRelativeCredit", totalElderlyRelativeCredit);

  //TOTAL FEE FOR ALL COURSES FORMULA
  let totalFeesCourses = 0;
  //=((MIN(F140,E55)-F139 +MIN(E59,F140)-F139)*F141
  //if(E52=Yes,=((MIN(F140,E55)-F139)+(MIN(E59,F140)-F138))*F141,0)
  let totalFeesCoursesFullTime = 0;
  let totalFeesCoursesPartTime = 0;
  if (tuitionFeesCredit) {
    students.forEach(({ fullTimeCourse, fees }) => {
      if (fullTimeCourse === "Full Time")
        totalFeesCoursesFullTime += Math.min(fees, courseMaximum);
      if (fullTimeCourse === "Part Time")
        totalFeesCoursesPartTime += Math.min(fees, courseMaximum);
    });
    totalFeesCoursesFullTime -= fullTimeCourseDisregardedAmount;
    totalFeesCoursesPartTime -= partTimeCourseDisregardedAmount;

    totalFeesCourses =
      ((totalFeesCoursesFullTime + totalFeesCoursesPartTime) *
        percentageAllowable) /
      100;
  }
  console.log("totalFeesCourses", totalFeesCourses);

  //RENT CALCULATIONS
  let totalRent = 0;
  payRentDetails.forEach(({ propertyType, rentPaid, year: year1 }) => {
    if (year === year1) {
      if (propertyType === "primary") {
        totalRent +=
          type === "single" || type === "singleParent"
            ? Math.min(rentPerPerson, (rentPaid * maxPercentageOfRent) / 100)
            : Math.min(rentPerCouple, (rentPaid * maxPercentageOfRent) / 100);
      } else if (propertyType === "dependentChild") {
        totalRent +=
          type !== "single" &&
          Math.min(rentPerPerson, (rentPaid * maxPercentageOfRent) / 100);
      }
    }
  });
  console.log("totalRent", totalRent, rentPerPerson);

  //MISC CALCULATIONS
  const miscWorkFromHome = (totalPriceWorkedFromHome * 20) / 100;
  console.log("miscWorkFromHome", miscWorkFromHome);

  //Health Expenses
  let totalHealthExpenses = 0;
  incurHealthExpensesDetail.forEach(
    ({
      gpHospConsultant,
      prescriptions,
      nonRoutineDental,
      year: year1,
      careHomeCarer,
      otherAmount,
    }) => {
      if (year1 === year) {
        totalHealthExpenses =
          ((gpHospConsultant +
            prescriptions +
            nonRoutineDental +
            careHomeCarer +
            otherAmount) *
            allowableHealthExpenses) /
          100;
      }
    }
  );

  totalHealthExpenses = (totalHealthExpenses * 20) / 100;
  console.log("totalHealthExpenses", totalHealthExpenses);
  //

  //Medical Insurance
  let medicalInsurance = 0;
  if (spouseEmployerPays) {
    employerPaysDetails.forEach(
      ({ amount, adultsCovered, childrenCovered, year: year1 }) => {
        if (year === year1) {
          medicalInsurance = Math.min(
            amount,
            adultsCovered * maxPerAdult + childrenCovered * maxPerChild
          );
        }
      }
    );
  }
  medicalInsurance = (medicalInsurance * 20) / 100;
  console.log("medicalInsurance", medicalInsurance);

  //pension
  const pensionAdditionalCredits = (totalPension * 20) / 100;
  const incomeProtectionAdditionalCredits = (totalIncomeProtection * 20) / 100;

  console.log(
    "pensionAdditionalCredits",
    pensionAdditionalCredits,
    "incomeProtectionAdditionalCredits",
    incomeProtectionAdditionalCredits
  );

  const totalTaxCredit =
    standardCredits +
    widowTrail1 +
    incapacitatedChild +
    totalElderlyRelativeCredit +
    totalFeesCourses +
    totalRent +
    miscWorkFromHome +
    totalHealthExpenses +
    medicalInsurance +
    pensionAdditionalCredits +
    incomeProtectionAdditionalCredits;

  console.log("totalTaxCredit", totalTaxCredit);

  const netIncomeTaxDue = totalGrossIncome - totalTaxCredit;
  console.log("netIncomeTaxDue", netIncomeTaxDue);

  ////***********************************SECTION 4 *************************************************** */
  //USC Calculation

  const usc1 =
    (Math.min(grossIncomeUsc, uscBands[0]) * uscRatesPercentage[0]) / 100;
  console.log("usc1", usc1);

  const usc2 =
    (Math.min(grossIncomeUsc - usc1, uscBands[1]) * uscRatesPercentage[1]) /
    100;
  console.log("usc2", usc2);

  const usc3 =
    (Math.min(grossIncomeUsc - uscBands[0] - uscBands[1], uscBands[2]) *
      uscRatesPercentage[2]) /
    100;
  console.log("usc3", usc3);
  const usc4 =
    ((grossIncomeUsc - uscBands[0] - uscBands[1] - uscBands[2]) *
      (fullGpMedicalCard
        ? medicalCardExemptionTopRate
        : uscRatesPercentage[3])) /
    100;

  console.log("usc4", usc4);

  //add total
  const totalUsc = usc1 + usc2 + usc3 + usc4;
  console.log("totalUsc", totalUsc);

  const netTaxDue = netIncomeTaxDue + totalUsc;
  console.log("netTaxDue", netTaxDue);

  const taxResult = taxPaidTotal - netTaxDue;
  console.log("taxResult", taxResult);

  const priorRebates = 450;
  const finalFigureForCustomer = taxResult - priorRebates;
  console.log("finalFigureForCustomer", finalFigureForCustomer);
};

exports.taxRates = async (req, res, next) => {
  try {
    // console.log("body", req.body);
    const yearToUpdate = req.body.year;
    const updatedTaxRates = await TaxDefaultValues.findOneAndUpdate(
      { year: yearToUpdate },
      req.body,
      {
        upsert: true,
        new: true,
      }
    );
    // if (!updatedTaxRates) throw new AppError("Year not found", 404);

    sendAppResponse({
      res,
      updatedTaxRates,
      statusCode: 200,
      status: "success",
      message: "Tax Rates successfully posted.",
    });
  } catch (error) {
    next(error);
  }
};

exports.taxCalculations = async (req, res, next) => {
  //   console.log("tax calculated", );

  const { year, type } = req.body;
  const userId = req.user?._id;
  // console.log(year);

  // console.log(age);
  calculate(year, userId, type);

  // const {}

  sendAppResponse({
    res,
    // taxCalculations,
    statusCode: 200,
    status: "success",
    message: "Tax Calculations successfully fetched.",
  });
};
