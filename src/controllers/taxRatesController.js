const sendAppResponse = require('../utils/helper/appResponse');
const { ObjectId } = require('mongodb');
const AppError = require('../errors/AppError');
const TaxDefaultValues = require('../models/taxDefaultValuesModel');
const PersonalInfo = require('../models/personalDetailsModel');
const OtherDetails = require('../models/otherDetailsModel');
const HomeDetails = require('../models/homeDetailsModel');
const FamilyDetails = require('../models/familyDetailsModel');
const HealthDetails = require('../models/healthDetailsModel');
const EmploymentSummary = require('../models/employmentSummary');
const CalculationDetail = require('../models/calculationDetailsModel');

const calculate = async (year, userId) => {
  //get the tax values and age

  const { summaryDetails } =
    (await EmploymentSummary.findOne({
      userId,
      year,
    })) || {};

  let grossIncomeUsc = 0;
  let grossTaxableIncome = 0;
  let taxPaid = 0;
  let uscPaid = 0;

  summaryDetails?.forEach((item) => {
    grossIncomeUsc += item.gross_pay;
    grossTaxableIncome += item.pay_for_income_tax;
    taxPaid += item.income_tax_paid;
    uscPaid += item.usc_paid;
  });
  const taxPaidTotal = taxPaid + uscPaid; //=SUM(D10:D11)

  console.log(
    'grossIncomeUsc',
    grossIncomeUsc,
    'grossTaxableIncome',
    grossTaxableIncome,
    'taxPaid',
    taxPaid,
    'uscPaid',
    uscPaid
  );
  // console.log("taxSummary", taxSummary);

  const {
    exemptionLimitsOver65,
    taxBands,
    taxRates: { over65ExemptionRatePercent, lowerRatePercent, marginalRatePercent },
    taxCredits: {
      personalSingle,
      widowNoDependants,
      widowCreditYearly,

      ageCreditSingle,
      ageCreditMarried,

      married,
      paye,
      singleParent,
      incapacitated,

      homeCarer,
      homeCarerEarningLimitsMin,

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
    flatRateExpense,
    uscRatesBands: { uscRatesPercentage, uscBands, medicalCardExemptionTopRate },
  } = await TaxDefaultValues.findOne({ year });
  const { dateOfBirth, maritalStatus, spousePassDate } = await PersonalInfo.findOne({ userId });
  const { contributionDetails } = (await OtherDetails.findOne({ userId })) || {};
  const { workFromHomeDetails, payRentDetails } = await HomeDetails.findOne({
    userId,
  });
  const {
    incapacitatedChildren,
    incapacitatedChildrenDetails,
    dependentChildren,

    elderlyRelativeCare,
    elderlyRelative,
    children,

    tuitionFeesCredit,
    students,
  } = (await FamilyDetails.findOne({ userId })) || {};

  const { incurHealthExpensesDetail, spouseEmployerPays, employerPaysDetails, fullGpMedicalCard } =
    (await HealthDetails.findOne({ userId })) || {};

  let type = '';
  let marriedType = summaryDetails?.some(({ summary_type }) => summary_type === 'spouse');
  console.log('marriedType', marriedType);

  // const result = marriedType.some((item) => item.spouse === "spouse");

  if (maritalStatus === 'single' && (!incapacitated || !dependentChildren)) {
    type = 'single';
  } else if (maritalStatus === 'widowed' && (incapacitated || dependentChildren)) {
    type = 'singleParent';
  } else if (maritalStatus === 'Married') {
    type = marriedType ? 'married2Income' : 'married1Income';
  }
  //   console.log("type", type);

  // Get the year of birth from the date
  const birthYear = dateOfBirth?.getUTCFullYear();
  const currentYear = new Date().getUTCFullYear();
  const age = currentYear - birthYear;

  let over65Exemption = 0;
  let standardRateBand = 0;
  let grossIncomePercent = 0;

  //***********************************SECTION 1 *************************************************** */
  console.log('=========== age ==============', age);

  if (age > 65) {
    const exemption =
      type === 'single' || type === 'singleParent'
        ? exemptionLimitsOver65[type]
        : exemptionLimitsOver65['married'];
    // console.log("=========== exemption ==============",grossTaxableIncome, exemption );
    over65Exemption = Math.min(grossTaxableIncome, exemption);
    grossIncomePercent = over65ExemptionRatePercent ? over65ExemptionRatePercent / 100 : 0; //=IF(A15=">65",0,'Questions for App'!F105)
  } else {
    const band = taxBands[type];
    // console.log(taxBands[type]);
    standardRateBand = band;
    grossIncomePercent = lowerRatePercent / 100;
    console.log('band', band);
  }

  //calculations for pension related to year and the personal and spouse (Question App G85)
  const PensionAndIncomeProtection = contributionDetails?.filter((item) => item.year === year);
  const totalPension = PensionAndIncomeProtection?.reduce((a, b) => a + b.pension, 0) || 0;
  const totalIncomeProtection =
    PensionAndIncomeProtection?.reduce((a, b) => a + b.incomeProtection, 0) || 0;
  //calculation for work from home related to year
  const { daysWorkedFromHome, totalCostOfLightingAndHeat, costOfBroadband } =
    workFromHomeDetails?.find((item) => item.year === year) || {};
  const totalPriceWorkedFromHome =
    (daysWorkedFromHome / 365) * (totalCostOfLightingAndHeat + costOfBroadband) || 0; // (E70 / 365* Sum(E71:E72))

  //   console.log('============ Pension Area ==============')
  //   console.log(standardRateBand, over65Exemption);
  //   console.log(totalPension, totalIncomeProtection);
  //   console.log(totalPriceWorkedFromHome);
  //   console.log(grossIncomePercent,marginalRatePercent);

  //=IF(A15=">65",MIN('Questions for App'!F113,'Calculations for App'!D9),0) + =IF(A15=">65",0,'Questions for App'!F108) +
  // ='Questions for App'!G85  + ='Questions for App'!G86 + ='Questions for App'!G70

  console.log('totalPriceWorkedFromHome', totalPriceWorkedFromHome);

  const adjustedBand =
    over65Exemption +
      standardRateBand +
      totalPension +
      totalIncomeProtection +
      (flatRateExpense || 100) +
      (totalPriceWorkedFromHome || 0); //=SUM(D15:D19)
  console.log('adjustedBand', adjustedBand);

  const grossIncome1 = Math.min(grossTaxableIncome, adjustedBand); //=MIN(D20,D9)
  let grossIncome2 = grossTaxableIncome - adjustedBand > 0 ? grossTaxableIncome - adjustedBand : 0; //=IF(D9-D21>0,D9-D21,0)
  const totalGrossIncome =
    grossIncome1 * grossIncomePercent + grossIncome2 * (marginalRatePercent / 100); //=(D21*C21)+(D22*C22)
  console.log('totalGrossIncome', totalGrossIncome);

  //***********************************SECTION 2 *************************************************** */
  //Standard Credits
  // console.log(spousePassDate);

  // console.log(

  //   spousePassDate.getUTCFullYear(),
  //   year,
  //   totalYearsPassedSpouse,
  //   widow
  // );
  console.log('widowNoDependants', widowNoDependants);

  let personal = maritalStatus === 'widowed'
  ? widowNoDependants :
    type === 'single' || type === 'singleParent'
      ? personalSingle
      : married; //=IF('Questions for App'!E15="widowed",'Questions for App'!F120,'Questions for App'!F116)

  console.log('personal', personal);

  const totalPaye = type === 'married2Income' ? paye + paye : paye;
  console.log('totalPaye', totalPaye);
  const singleParentFullTimeCourse = students?.find(
    (item) => item.year === year && item?.fullTimeCourse === 'fullTime'
  );
  const singleParentStandardCredits =
    type === 'singleParent' && singleParentFullTimeCourse ? singleParent : 0;

  const standardCredits = personal + totalPaye + singleParentStandardCredits; //we have taken paye for one only
  console.log('standardCredits', standardCredits);

  //***********************************SECTION 3 *************************************************** */
  //Additional Credits
  //age credit is not defined (need to work on it)
  const ageCredit =
    age >= 65 ? (maritalStatus === 'single' ? ageCreditSingle : ageCreditMarried) : 0;

  // console.log(widowTrail);
  totalYearsPassedSpouse = maritalStatus === 'widowed' && year - spousePassDate.getUTCFullYear();
  const widow =
    totalYearsPassedSpouse > 0 ? (widowNoDependants || 0) - (totalYearsPassedSpouse - 1) * 450 : 0;

  let widowTrail = maritalStatus === 'widowed' ? widow : 0; //formula should be understand from questions app
  // Carer Missed for married (Question app M37)
  // =IF(AND(E37>0,E128-((N2-E129)/2)>0),E128-((N2-E129)/2),0)

  let married1incomes = 100000;
  let carerCredit = grossTaxableIncome < 7200
  ? 1600
  : grossTaxableIncome > 10600
    ? 0
    : 1600 - ((grossTaxableIncome - 7200) / 2);
  console.log('carerCredit', carerCredit);

  let incapacitatedChild = incapacitatedChildrenDetails?.length ? incapacitated : 0;

  console.log('widowTrail', widowTrail);
  console.log('incapacitatedChild', incapacitatedChild);
  // console.log(incapacitatedChild);

  let totalElderlyRelativeCredit = 0; //years should be mentioned
  if (elderlyRelativeCare) {
    elderlyRelative?.forEach(({ annualIncome, yearsOfCare }) => {
      if (yearsOfCare?.includes(year)) {
        if (annualIncome <= dependantRelativeLimits) {
          // either compare with individual annualIncome or with sum of all relative ??
          totalElderlyRelativeCredit += dependentRelative;
        } else totalElderlyRelativeCredit += 0;
      }
    });
  }
  console.log('totalElderlyRelativeCredit', totalElderlyRelativeCredit);

  //TOTAL FEE FOR ALL COURSES FORMULA                                                                                                                                                                                                   \\\\\\\\\\\\\\\
  let totalFeesCourses = 0;
  //=((MIN(F140,E55)-F139 +MIN(E59,F140)-F139)*F141
  //if(E52=Yes,=((MIN(F140,E55)-F139)+(MIN(E59,F140)-F138))*F141,0) individual or total??
  let totalFeesCoursesFullTime = 0;
  let totalFeesCoursesPartTime = 0;
  let hasFullTimeCourse = false; // Track if there are full-time courses
  let hasPartTimeCourse = false; // Track if there are part-time courses

  if (tuitionFeesCredit) {
    students?.forEach(({ fullTimeCourse, fees }) => {
      if (fullTimeCourse === 'fullTime') {
        totalFeesCoursesFullTime += Math.min(fees, courseMaximum);
        hasFullTimeCourse = true;
      }
      if (fullTimeCourse === 'partTime') {
        totalFeesCoursesPartTime += Math.min(fees, courseMaximum);
        hasPartTimeCourse = true;
      }
    });

    //if full time and part time it subtract from fulltime disregard amount
    //if we dont have full time and only parttime it subtract from parttime disregard amount
    let deductAmount =
      !hasFullTimeCourse && hasPartTimeCourse
        ? partTimeCourseDisregardedAmount
        : fullTimeCourseDisregardedAmount;

    totalFeesCoursesFullTime = totalFeesCoursesFullTime + totalFeesCoursesPartTime - deductAmount;

    // Calculate total fees
    totalFeesCourses = (totalFeesCoursesFullTime * percentageAllowable) / 100;
  }
  console.log('totalFeesCourses', totalFeesCourses);

  //RENT CALCULATIONS
  //=IF(E62="Yes",MIN(F134,F136*E65),0)
  let totalRent = 0;
  payRentDetails.forEach(({ propertyType, rentPaid, year: rentYear }) => {
    if (year === rentYear) {
      if (propertyType === 'primary') {
        totalRent +=
          type === 'single' || type === 'singleParent'
            ? Math.min(rentPerPerson, (rentPaid * maxPercentageOfRent) / 100)
            : Math.min(rentPerCouple, (rentPaid * maxPercentageOfRent) / 100);
      } else if (propertyType === 'dependentChild') {
        totalRent +=
          type !== 'single' && Math.min(rentPerPerson, (rentPaid * maxPercentageOfRent) / 100);
      }
    }
  });
  console.log('totalRent', totalRent, rentPerPerson);

  //MISC CALCULATIONS
  const miscWorkFromHome = (totalPriceWorkedFromHome * 20) / 100 || 0;
  console.log('miscWorkFromHome', miscWorkFromHome);

  //Health Expenses
  // G76 * 20%  ==> G76 --> =SUM(E76:E80)*F143
  let totalHealthExpenses = 0;
  incurHealthExpensesDetail?.forEach(
    ({
      gpHospConsultant,
      prescriptions,
      nonRoutineDental,
      year: healthYear,
      careHomeCarer,
      otherAmount,
    }) => {
      if (healthYear === year) {
        totalHealthExpenses +=
          ((gpHospConsultant + prescriptions + nonRoutineDental + careHomeCarer + otherAmount) *
            allowableHealthExpenses) /
          100;
      }
    }
  );

  totalHealthExpenses = (totalHealthExpenses * 20) / 100;
  console.log('totalHealthExpenses', totalHealthExpenses);
  //

  //Medical Insurance
  // G81 * 20%  ==> G81 --> MIN(E82,(E83*F145)+(E84*F146))

  let medicalInsurance = 0;
  if (spouseEmployerPays) {
    employerPaysDetails?.forEach(
      ({ amount, adultsCovered, childrenCovered, year: employerPaysYear }) => {
        if (year === employerPaysYear) {
          medicalInsurance += Math.min(
            amount,
            adultsCovered * maxPerAdult + childrenCovered * maxPerChild
          );
        }
      }
    );
  }
  medicalInsurance = (medicalInsurance * 20) / 100;
  console.log('medicalInsurance', medicalInsurance);

  //pension
  const pensionAdditionalCredits = (totalPension * 20) / 100;
  const incomeProtectionAdditionalCredits = (totalIncomeProtection * 20) / 100;

  console.log(
    'pensionAdditionalCredits',
    pensionAdditionalCredits,
    'incomeProtectionAdditionalCredits',
    incomeProtectionAdditionalCredits
  );

  const totalTaxCredit =
    standardCredits +
    ageCredit +
    widowTrail +
    incapacitatedChild +
    totalElderlyRelativeCredit +
    totalFeesCourses +
    totalRent +
    miscWorkFromHome +
    totalHealthExpenses +
    medicalInsurance +
    pensionAdditionalCredits +
    incomeProtectionAdditionalCredits;

  console.log('totalTaxCredit', totalTaxCredit);

  const netIncomeTaxDue = totalGrossIncome - totalTaxCredit || 0;
  console.log('netIncomeTaxDue', netIncomeTaxDue);

  ////***********************************SECTION 4 *************************************************** */
  //USC Calculation

  const usc1 = (Math.min(grossIncomeUsc, uscBands[0]) * uscRatesPercentage[0]) / 100;
  console.log('usc1', usc1);

  const usc2 = (Math.min(grossIncomeUsc - usc1, uscBands[1]) * uscRatesPercentage[1]) / 100;
  console.log('usc2', usc2);

  const usc3 =
    (Math.min(grossIncomeUsc - (usc1 + usc2), uscBands[2]) * uscRatesPercentage[2]) / 100;
  console.log('usc3', usc3);
  const usc4 =
    ((grossIncomeUsc - (usc1 + usc2 + usc3)) *
      (fullGpMedicalCard ? medicalCardExemptionTopRate : uscRatesPercentage[3])) /
    100;

  console.log('usc4', usc4);

  //add total
  const totalUsc = usc1 + usc2 + usc3 + usc4;
  console.log('totalUsc', totalUsc);
  // =D48+D63
  const netTaxDue = netIncomeTaxDue + totalUsc;
  console.log('netTaxDue', netTaxDue);
  // =D13-D65
  const taxResult = taxPaidTotal - netTaxDue;
  console.log('taxResult', taxResult);

  const priorRebates = 450; // will get from the document
  //=D67-D69
  const finalFigureForCustomer = taxResult - priorRebates;
  console.log('finalFigureForCustomer', finalFigureForCustomer);

  const payload = {
    year,
    grossIncomeUsc,
    grossTaxableIncome,
    taxPaid,
    uscPaid,
    taxPaidTotal,
    exemptionLimitsOver65:over65Exemption,
    standardRateBand,
    pension: totalPension || 0, // totalPension
    incomeProtection: totalIncomeProtection, // totalIncomeProtection
    workFromHome: totalPriceWorkedFromHome, // totalPriceWorkedFromHome
    adjustedBand,
    adjustedBandOne: grossIncome1,
    adjustedBandTwo: grossIncome2,
    adjustedBandOnePercentage: lowerRatePercent,
    adjustedBandTwoPercentage: marginalRatePercent,
    grossIncomeDue: totalGrossIncome,
    personal,
    paye: totalPaye, //totalPaye
    singleParent: singleParentStandardCredits, // singleParentStandardCredits
    flatRateExpense, //TBD is a default value
    ageCredit, // please set a hard code value for now
    widowTrail,
    carer: carerCredit, // carerCredit
    Incapacitation: incapacitatedChild, //incapacitatedChild
    elderlyRelative: totalElderlyRelativeCredit, // totalElderlyRelativeCredit
    tuition: totalFeesCourses, //totalFeesCourses
    rent: totalRent, //totalRent
    workFromHomePer: miscWorkFromHome, //miscWorkFromHome
    healthExpense: totalHealthExpenses || 0, //totalHealthExpenses
    medicalInsurance: medicalInsurance, //medicalInsurance
    pensionCredits: pensionAdditionalCredits, // pensionAdditionalCredits
    incomeProtectionCredits: incomeProtectionAdditionalCredits, //incomeProtectionAdditionalCredits
    totalTaxCredit: totalTaxCredit || 0,
    netIncomeTaxDue,
    usc1,
    usc2,
    usc3,
    usc4,
    totalUsc,
    netTaxDue,
    taxResult,
    priorRebates,
    finalResult: finalFigureForCustomer, //finalFigureForCustomer
  };
  return payload;
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
      status: 'success',
      message: 'Tax Rates successfully posted.',
    });
  } catch (error) {
    next(error);
  }
};

exports.taxCalculations = async (req, res, next) => {
  //   console.log("tax calculated", );

  const { year, userId } = req.body;

  // const userId = req.user?._id;
  // console.log(year);

  // console.log(age);
  const calculation = await calculate(year, userId);
  // console.log("###################", calculation);
  const saveCalculations = await CalculationDetail.findOneAndUpdate(
    { year, userId: new ObjectId(userId) },
    { ...calculation, userId: new ObjectId(userId) },
    {
      upsert: true,
      new: true,
    }
  );
  if (!saveCalculations) throw new AppError('Calculations not saved', 404);

  sendAppResponse({
    res,
    saveCalculations,
    statusCode: 200,
    status: 'success',
    message: 'Tax Calculations successfully fetched.',
  });
};
exports.getCalculations = async (req, res, next) => {
  try {
    const { userId } = req?.body || {};
    const calculations = await CalculationDetail.find({ userId });
    if (!calculations.length) throw new AppError('Calculations not found', 404);

    sendAppResponse({
      res,
      calculations,
      statusCode: 200,
      status: 'success',
      message: 'Calculations successfully fetched.',
    });
  } catch (error) {
    next(error);
  }
};
