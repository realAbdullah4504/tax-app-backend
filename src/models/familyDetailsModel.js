const mongoose = require("mongoose");

const childrenDetail = {
    name: String,
    dateOfBirth: Date,
    ppsn: String,
  };
  const studentDetail = {
    name: String,
    fullTime: Boolean,
    fees: Number,
  };

const familySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  dependantChildren: Number,
  children: [childrenDetail],
  incapacitatedChildren: Number,
  incapacitatedChildrenDetails: [childrenDetail],
  elderlyRelativeCare: Boolean,
  elderlyRelativeName: String,
  elderlyRelativePpsn: String,
  elderlyRelativeIncome: Number,
  tuitionCredit: Boolean,
  students: [studentDetail],
});
const FamilyDetails = mongoose.model("FamilyDetails", familySchema);
module.exports = FamilyDetails;
