const twilio = require("twilio");
const crypto = require("crypto");

const User = require("../models/userModel");
const FamilyDetails = require("../models/familyDetailsModel");
const HealthDetails = require("../models/healthDetailsModel");
const HomeDetails = require("../models/homeDetailsModel");
const OtherDetails = require("../models/otherDetailsModel");
const PersonalInfo = require("../models/personalDetailsModel");
const AppError = require("../errors/AppError");

const { ACCOUNT_SID, AUTH_TOKEN, VERIFY_SID } = require("../../config/vars");

const client = new twilio(ACCOUNT_SID, AUTH_TOKEN);

const filterObj = (obj = {}, allowedFields = []) => {
  const newObj = {};
  allowedFields.map((key) => {
    if (obj.hasOwnProperty(key)) newObj[key] = obj[key];
  });
  return newObj;
};
const getSchemaByType = (type) => {
  switch (type) {
    case "personalInfo":
      return PersonalInfo;
    case "homeDetails":
      return HomeDetails;
    case "healthDetails":
      return HealthDetails;
    case "familyDetails":
      return FamilyDetails;
    case "otherDetails":
      return OtherDetails;
      case "user":
      return User;
    default:
      throw new Error("Invalid type");
  }
};
const UserService = {
  async registerUser(userData) {
    try {
      const user = new User(userData);
      const resp = await user.save();
      return resp;
    } catch (error) {
      throw error;
    }
  },

  async updatedUser({ id, data }) {
    // filtered out the unwanted fields that are not allowed to be updated
    // const filterBody = filterObj(body, ["name", "email"]);

    // update the current user data
    await User.findByIdAndUpdate(id, data, {
      new: false,
      runValidator: true,
    });
  },

  async userExists({ email, phoneNumber }) {
    // Function to check if a user exists by email or phone number:
    const count = await User.countDocuments({
      $or: [{ email: email }, { phoneNumber: phoneNumber }],
    });
    return count;
  },

  async sendVerificationCode(phoneNumber) {
    try {
      const verification = await client.verify.v2
        .services(VERIFY_SID)
        .verifications.create({ to: phoneNumber, channel: "sms" });
    } catch (error) {
      console.error("Error sending verification code:", error.message);
      throw new AppError("Failed to send verification code.", 400);
    }
  },
  async VerifyUserCode(phoneNumber, code) {
    try {
      const verification = await client.verify.v2
        .services(VERIFY_SID)
        .verificationChecks.create({ to: phoneNumber, code: code });
      if (!verification?.valid || verification.status === "pending") {
        throw new AppError("Your code is invalid", 400);
      }
    } catch (error) {
      console.error("Error sending verification code:", error.message);
      throw new AppError("Your code is invalid", 400);
    }
  },

  async findUserByEmail(email) {
    return User.findOne({ email }).select("+password");
  },

  async findUserByPhone(phoneNumber) {
    return await User.findOne({ phoneNumber }); //.select('+password');
  },

  async findUserById(id) {
    const resp = await User.findById(id); //.select('+password');
    return resp;
  },

  async authenticateUser(email, password) {
    const user = await this.findUserByEmail(email);
    if (!user || !(await user.isValidPassword(password))) {
      return null;
    }
    return user;
  },

  generateToken(user) {
    return user.generateToken();
  },

  async loginUser(email, password) {
    try {
      const user = await this.authenticateUser(email, password);
      if (!user) {
        return null;
      }

      return user;
    } catch (error) {
      throw error;
    }
  },
  async getCurrentUserDetail(id) {
    try {
      const UserInfo = await User.findOne({ _id: id });
      const personalInfo = await PersonalInfo.findOne({ userId: id });
      const homeDetails = await HomeDetails.findOne({ userId: id });
      const healthDetails = await HealthDetails.findOne({ userId: id });
      const familyDetails = await FamilyDetails.findOne({ userId: id });
      const otherDetails = await OtherDetails.findOne({ userId: id });
      const userDetail = {
        user: UserInfo || {},
        personalInfo: personalInfo || {},
        homeDetails: homeDetails || {},
        healthDetails: healthDetails || {},
        familyDetails: familyDetails || {},
        otherDetails: otherDetails || {},
      };
      return userDetail;
    } catch (error) {
      throw error;
    }
  },
  async updateCurrentUser(id, type, payload) {
    try {
      const Model = getSchemaByType(type);
      const condition = type === 'user' ? {_id:id} : {userId:id}
      const updatedUser = await Model.findOneAndUpdate(
        condition,
        payload,
        {
          upsert: true,
          new: true,
        }
      );
      return updatedUser;
    } catch (error) {
      throw error;
    }
  },
  async forgotPasswordUser(email, baseUrl) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new AppError("There is no user with the email address.", 404);
      }
      const resetToken = user.createPasswordResetToken();
      await user.save({ validateBeforeSave: false });
      const resetUrl = `${baseUrl}/${resetToken}`;
      return resetUrl;
    } catch (error) {
      throw error;
    }
  },
  async resetPasswordUser(token, password, confirmPassword) {
    if(password !== confirmPassword){
      throw new AppError("password and confirm password.", 400);
    }
    // 1 Get user based on the token
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpiry: { $gt: Date.now() },
    });
    // 2 if token is not expired, there is a user, set new password
    if (!user) {
      throw new AppError("Token is invalid or expired.", 400);
    }
    // 3 update the changePasswordAt property for the user
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    const resp = await user.save();
    return resp;
  },

  /**
   * Fetch users list
   * @param {*} type 
   */
 async fetchUsersList(type){
    const query = {
      ...(type&& {userType:type})
    }
    return await User.find(query);
 },

  /**
   * Fetch user detail
   * @param {*} id
   */
  async fetchUserDetail(id){
    return await User.findById(id);
 },

  /**
   * Fetch user question detail
   * @param {*} type 
   * @param {*} userId 
   * @returns 
   */
   async fetchUserQuestionsDetail(type,userId){
    const Model=getSchemaByType(type);
    return await Model.findOne({userId});
 },

 /**
  * 
  * @param {*} userId 
  * @returns 
  * service function to delete user by id
  */
 async deleteUser(userId){
  return await User.deleteOne({_id:userId});
},

};



module.exports = UserService;
