const mongoose = require("mongoose");
const personalDetailsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  ppsn: String,
  dateOfBirth: Date,
  occupation: String,
  hasIncomeOutsidePyeOrSocialWelfare: Boolean,
  spouseDetails: {
    firstName: String,
    surname: String,
    spouseEmail: String,
    spouseMobilePhoneNumber: String,
    spousePpsn: String,
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
  
});
const PersonalDetails = mongoose.model(
  "PersonalDetails",
  personalDetailsSchema
);
module.exports = PersonalDetails;
