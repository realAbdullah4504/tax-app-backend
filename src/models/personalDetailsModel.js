const mongoose = require("mongoose");
const personalDetailsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  ppsn: String,
  signature:String,
  dateOfBirth: Date,
  hasIncomeOutsidePyeOrSocialWelfare: Boolean,
  spouseDetails: {
    spouseFirstName: String,
    spouseSurname: String,
    spouseEmail: String,
    spouseMobilePhoneNumber: String,
    spousePpsn: String,
    spouseDateOfBirth: Date,
    spouseOccupation: String,
    spouseHasIncomeOutsidePyeOrSocialWelfare: Boolean,
  },
  address: {
    addressLine: String,
    city: String,
    eirCode: String,
    country: String,
  },
  residentIreland: Boolean,
  domicileIreland: Boolean,
  taxAssessmentMethod: String,
  nominatedSpouseToFileTax: Boolean,
  maritalStatus: String,
  fileTaxesAs: String,
  marriageDate: Date,
  spousePassDate: Date,
  divorceDate: Date,
  currentStep:Number,
  isComplete:Boolean
},
{
  timestamps: true,
});
const PersonalDetails = mongoose.model(
  "PersonalDetails",
  personalDetailsSchema
);

module.exports = PersonalDetails;
