const mongoose = require("mongoose");
const flatRateExpenseSchema = new mongoose.Schema({
  year:Number,
  actorFreelance:{
    freeLanceActorChargeablePaye:Number
  },
  drivingInstructor:Number,
  airlineIndustry: {
    airlineCabinCrews: Number,
    pilotsAirlinePilotsAssociation: Number
  },
  education: {
    guidanceCounsellors: Number,
    physicalEducationTeachers: Number,
    teachersExcludingGuidanceCounsellors: Number,
    thirdLevelAcademicStaff: Number
  },
  buildersRelatedTrades: {
    bricklayer: Number,
    cabinetMakers: Number,
    carpenters: Number,
    driver: Number,
    electrician: Number,
    fitterMechanic: Number,
    floorLayer: Number,
    generalOperatives: Number,
    joiners: Number,
    mason: Number,
    painters: Number,
    pipeFitterWelder: Number,
    plasterer: Number,
    plumberNonWelder: Number,
    plumberWelder: Number,
    polishers: Number,
    professionals: Number,
    rooferSlater: Number,
    scaffolder: Number,
    sheeter: Number,
    steelErector: Number,
    stoneCutter: Number,
    tiler: Number,
    upholsterers: Number,
    woodCuttingMachinists: Number
  },
  cosmetology: {
    cosmetologists: Number
  },
  engineeringElectrical: {
    employedByCivilService: Number,
    employedByLocalAuthorities: Number,
    employedByEircomCoillteOPW: Number,
    employedByOther: Number
  },
  fishing: {
    fishermenInEmployment: Number
  },
  horseRacingIndustry: {
    groomsRacehorseTraining: Number
  },
  hospitalHealthServices: {
    cardiacTechnicians: Number,
    consultantsHospital: Number,
    dentistsInEmployment: Number,
    doctorsHospitalIncludingConsultants: Number,
    homeHelps: Number,
    hospitalDomesticStaffAttendant:Number,
    hospitalDomesticStaffCatering:Number,
    hospitalDomesticStaffCateringSupervisor:Number,
    hospitalDomesticStaffCook:Number,
    hospitalDomesticStaffDriver:Number,
    hospitalDomesticStaffGeneralOperative:Number,
    hospitalDomesticStaffPorter:Number,
    hospitalDomesticStaffLaundryOperative:Number,
    hospitalDomesticStaffDomestic:Number,
    hospitalDomesticStaffKitchenPorter:Number,
    nurse: Number,
    nurseShortTermContractsThroughAgency: Number,
    nursingAssistant: Number,
    occupationalTherapist: Number,
    pharmacy: Number,
    physiotherapist: Number,
    radiographer: Number,
    respiratoryPulmonaryFunctionTechnicians: Number,
    dieticians: Number,
    medicalScientists: Number,
    radiationTherapists: Number,
    phlebotomists: Number,
    socialWorkers: Number,
    speechAndLanguageTherapists: Number
  },
  hotelBarTrade: {
    barTrade: Number,
    hotelIndustry: Number
  },
  journalism: {
    journalistIncludingPR: Number,
    journalistsExpenseAllowancesFromEmployers: Number
  },
  miningIndustry: {
    minersShiftBossesUnderground: Number,
    millProcessWorkersShiftBosses: Number,
    steamCleaners: Number,
    surfaceWorkers: Number
  },
  motorRepairAndMotorAssembly: {
    assemblyWorkers: Number,
    greasers: Number,
    storemen: Number,
    generalWorkers: Number,
    fitters: Number,
    mechanics: Number
  },
  optometristsDispensingOpticians: {
    optometrist: Number,
    dispensingOptician: Number
  },
  printingBookbindingAndAlliedTrades: {
    bookbinder: Number,
    compositor: Number,
    linotype: Number,
    monotypeOperator: Number,
    copyHolder: Number,
    photoLithographers: Number,
    photoEngraver: Number,
    workersInTAndESectionOfNewspaper: Number,
    monotypeCasterAttendant: Number,
    stereotype: Number,
    machineMinder: Number,
    readersAndRevisers: Number,
    rotaryMachineMindersAndAssistants: Number,
    others: Number
  },
  publicSector: {
    civilService: Number,
    localAuthority: Number,
    semiStateBody: Number,
    defenceForces: Number
  },
  panelBeatersSheetMetalWorkers: {
    panelBeaters: Number,
    sheetMetalWorkers: Number
  },
  religious: {
    clergymanChurchOfIreland: Number,
    clergywomanChurchOfIreland: Number
  },
  retail: {
    shopAssistant: Number
  },
  shipping: {
    britishMerchantNavy: Number,
    mercantileMarineIrishShip: Number,
    dockers: Number
  },
  transport: {
    busEireann: Number,
    busAthaCliath: Number,
    iarnrodEireann: Number
  },
  veterinary: {
    veterinarySurgeonInEmployment: Number,
    veterinaryNurse: Number
  }
},
{
  timestamps: true,
});
const FlatRateExpense = mongoose.model(
  "FlatRateExpense",
  flatRateExpenseSchema
);

module.exports = FlatRateExpense;
