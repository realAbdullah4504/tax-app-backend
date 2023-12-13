const mongoose = require("mongoose");

const childrenDetail = {
  id: Number,
  name: String,
  levelOfEducation:String,
  dateOfBirth: Date,
  ppsn: String,
};
const IncapacitatedChildrenDetails = {
  id: Number,
  name: String,
  incapacityNature:String,
  dateOfBirth: Date,
  ppsn: String,
}
const studentDetail = {
  id: Number,
  year: Number,
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
const occupationsDetail = {
  id: Number,
  category: String,
  subCategory: String,
  years: [Number],
};
const familySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  taxReviewYears: [Number],
  occupations:[occupationsDetail],
  spouseOccupations:[occupationsDetail],
  dependantChildren: Boolean,
  children: [childrenDetail],
  incapacitatedChildren: Boolean,
  incapacitatedChildrenDetails: [IncapacitatedChildrenDetails],
  elderlyRelativeCare: Boolean,
  elderlyRelative: [elderlyRelativeDetail],
  tuitionFeesCredit: Boolean,
  students: [studentDetail],
  currentStep:Number,
  isComplete:Boolean
},
{
  timestamps: true,
});
const FamilyDetails = mongoose.model("FamilyDetails", familySchema);
module.exports = FamilyDetails;
