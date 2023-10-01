const mongoose = require("mongoose");

const childrenDetail = {
  id: Number,
  name: String,
  dateOfBirth: Date,
  ppsn: String,
  id: Number,
};
const studentDetail = {
  id: Number,
  years: [Number],
  name: String,
  fullTimeCourse: String,
  fees: Number,
};
const elderlyRelativeDetail = {
  id: Number,
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
  taxReviewYears: [Number],
  dependantChildren: Boolean,
  children: [childrenDetail],
  incapacitatedChildren: Boolean,
  incapacitatedChildrenDetails: [childrenDetail],
  elderlyRelativeCare: Boolean,
  elderlyRelative: [elderlyRelativeDetail],
  tuitionFeesCredit: Boolean,
  students: [studentDetail],
  currentStep:Number,
  isComplete:Boolean
});
const FamilyDetails = mongoose.model("FamilyDetails", familySchema);
module.exports = FamilyDetails;
