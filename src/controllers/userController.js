const User = require("../models/userModel");
const UserService = require("../services/userService");
const AppError = require("../errors/AppError");
const {
  JWT_SECRET,
  JWT_COOKIE_EXPIRE_IN,
  NODE_ENV,
} = require("../../config/vars");
const sendAppResponse = require("../utils/helper/appResponse");
const FamilyDetails = require("../models/familyDetailsModel");
const HealthDetails = require("../models/healthDetailsModel");
const HomeDetails = require("../models/homeDetailsModel");
const OtherDetails = require("../models/otherDetailsModel");
const PersonalInfo = require("../models/personalDetailsModel");

// getSchemeHelper

const getSchemaByType = (type) => {
  switch (type) {
    case "PersonalInfo":
      return PersonalInfo;
    case "HomeDetails":
      return HomeDetails;
    case "HealthDetails":
      return HealthDetails;
    case "FamilyDetails":
      return FamilyDetails;
    case "OtherDetails":
      return OtherDetails;
    default:
      throw new Error("Invalid type");
  }
};
exports.getUserDetail = async (req, res, next) => {
  try {
    const user = req.user;
    const personalInfo = await PersonalInfo.findOne({ userId: user._id });
    const homeDetails = await HomeDetails.findOne({ userId: user._id });
    const healthDetails = await HealthDetails.findOne({ userId: user._id });
    const familyDetails = await FamilyDetails.findOne({ userId: user._id });
    const otherDetails = await OtherDetails.findOne({ userId: user._id });
    const userDetail = {
      personalInfo: personalInfo || {},
      homeDetails: homeDetails || {},
      healthDetails: healthDetails || {},
      familyDetails: familyDetails || {},
      otherDetails: otherDetails || {},
    };

    sendAppResponse({
      res,
      userDetail,
      statusCode: 200,
      status: "success",
      message: "User detail fetched successfully.",
    });
  } catch (error) {
    next(error);
  }
};
exports.updateUserDetail = async (req, res, next) => {
  try {
    const { type, ...subType } = req.body;

    //check should be made whether subtype is number or string it fails to update the result when we post the number but it treated as string
    const details = {};
    for (const key in subType) {
      if (!isNaN(subType[key])) {
        details[key] = +subType[key];
      } else {
        details[key] = subType[key];
      }
    }

    // console.log(details);
    const schema = getSchemaByType(type);
    const user = req.user;
    const updateOrCreateUserDetail = await schema.findOneAndUpdate(
      { userId: user._id },
      details,
      {
        upsert: true,
        new: true,
      }
    );
    // console.log(updateOrCreateUserDetail);

    // console.log(user);
    // console.log(schema, subType);

    // fetch from personal info scheme
    // fetch from family scheme
    // fetch from health scheme
    // const userDetail = {
    //   personalInfo: personalInfo || {},
    // };
    // const user = req.user;
    // const type = req.body.type;
    // let payload = req.body;
    // // select scheme on the basis of type
    //getSchemeHelper
    // const schema = getSchemaByType(type);
    // delete type from payload
    // payload user add from
    // payload.userId = user?.id;
    // Model.createAndUpdate(id, payload)
    // const userDetail = {
    //   personalInfo: {},
    // };
    sendAppResponse({
      res,
      updateOrCreateUserDetail,
      statusCode: 200,
      status: "success",
      message: "User updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};
