const mongoose = require("mongoose");

const childrenDetail = {
  name: String,
  dateOfBirth: Date,
  ppsn: String,
};
const studentDetail = {
  name: String,
  fullTimeCourse: Boolean,
  years: [Number],
  fees: Number,
};
const elderlyRelativeDetail = {
  name: String,
  ppsn: String,
  annualIncome: Number,
  yearsOfCare: [Number],
};

const familySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  taxReviewYears: [String],
  dependantChildren: Number,
  children: [childrenDetail],
  incapacitatedChildren: Boolean,
  incapacitatedChildrenDetails: [childrenDetail],
  elderlyRelativeCare: Boolean,
  elderlyRelative: [elderlyRelativeDetail],
  tuitionCredit: Boolean,
  students: [studentDetail],
});
const FamilyDetails = mongoose.model("FamilyDetails", familySchema);
module.exports = FamilyDetails;
