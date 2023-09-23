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
  taxAssessmentMethod: String,
  nominatedSpouseToFileTax: Boolean,
  maritalStatus: String,
  marriageDate: Date,
  spousePassDate: Date,
  taxReviewYears: [Number],
});
const PersonalDetails = mongoose.model("PersonalDetails", personalDetailsSchema);
module.exports = PersonalDetails;
