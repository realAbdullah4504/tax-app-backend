const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');
const { JWT_SECRET, ACCOUNT_SID, AUTH_TOKEN, TWILIO_PHONE_NUMBER } = require('../../config/vars');
const AppError = require('../errors/AppError');


const client = new twilio(ACCOUNT_SID, AUTH_TOKEN);

const filterObj = (obj = {}, allowedFields = []) => {
  const newObj = {};
  allowedFields.map((key) => {
    if (obj.hasOwnProperty(key)) newObj[key] = obj[key];
  });
  return newObj;
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
      $or: [
        { email: email },
        { phoneNumber: phoneNumber }
      ]
    });
    return count > 0;
  },

  async sendVerificationCode(phoneNumber) {
    try {
      console.log("API Call.!! ", phoneNumber);
      const verificationCode = Math.floor(Math.random() * 900000) + 100000;  // Generate a 6-digit code
  
      // Perform the Twilio API call
      const response = await client.messages.create({
        body: `Your verification code is: ${verificationCode}`,
        to: phoneNumber,
        from: TWILIO_PHONE_NUMBER
      });
  
      if (response.status === "queued" || response.status === "sent") {
        console.log("Verification code sent successfully.");
        return verificationCode;
      } else {
        console.error("Failed to send verification code:", response.status);
        throw new Error("Failed to send verification code.");
      }
    } catch (error) {
      console.error("Error sending verification code:", error.message);
      throw new Error("Failed to send verification code.");
    }
  },

  async findUserByEmail(email) {
    return User.findOne({ email }).select('+password');
  },

  async findUserByPhone(phoneNumber) {
    return User.findOne({ phoneNumber }); //.select('+password');
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

      const token = this.generateToken(user);
      return token;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = UserService;
