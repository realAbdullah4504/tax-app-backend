const mongoose = require("mongoose");

const childrenDetail = {
  name: String,
  dateOfBirth: Date,
  ppsn: String,
};
const studentDetail = {
  years: [Number],
  name: String,
  fullTimeCourse: String,
  fees: Number,
};
const elderlyRelativeDetail = {
  name: String,
  ppsn: String,
  annualIncome: Number,
  yearsOfCare: [String],
};

const familySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  taxReviewYears: [String],
  dependantChildren:Boolean,
  children: [childrenDetail],
  incapacitatedChildren: Boolean,
  incapacitatedChildrenDetails: [childrenDetail],
  elderlyRelativeCare: Boolean,
  elderlyRelative: [elderlyRelativeDetail],
  tuitionFeesCredit: Boolean,
  students: [studentDetail],
});
const FamilyDetails = mongoose.model("FamilyDetails", familySchema);
module.exports = FamilyDetails;
