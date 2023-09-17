const { validationResult } = require('express-validator');
const AppError = require('../errors/AppError');
const UserService = require('../services/userService');
const { createSendToken } = require('./authController');
const User = require('../models/userModel');

const UserController = {
  async registerUser(req, res, next) {
    try {
      console.log("Reg Body ==> ", req.body);
      const errors = validationResult(req);
      console.log("Error msgs list:  ", errors.array());
      if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400);
      }

      const { firstName, surName, email, phoneNumber, password } = req.body;
      const existUser = await UserService.userExists({ email, phoneNumber });
      console.log("existUser ", existUser);
      if (!existUser) {
        // Send SMS code to mobile number and save reg record into db
        const verificationCode = await UserService.sendVerificationCode({phoneNumber});
        if (verificationCode) {
        const userData =  await UserService.registerUser(req.body);

          // const userData = await UserService.findUserByEmail(email);
          console.log("get user data ==> ", userData);
          const respMsg = 'Registration is successful! Please activate your account using the verification code sent to your registered phone number';
          createSendToken(userData, 200, res, respMsg);
          // res.json({ message: 'Registration is successful! Please activate your account using the verification code sent to your registered phone number' });
        } else {
          throw new AppError('Something went wrong to generate verification code', 500);
        }
      } else {
        res.json({ message: 'User already registered' });
      }

    } catch (error) {
      next(error);
    }
  },

  async verifyCode(req, res, next) {
    try {
      const { phoneNumber, code } = req.body;
      console.log("phoneNumber => ", phoneNumber);

      const userData = await UserService.findUserByPhone(phoneNumber);
      console.log("userData ==> ", userData);

      if (userData?.verificationCode === parseInt(code)) {
        const updateData = {
          verificationCode: null,
          active: true
        };
        // update the current user data
        const updatedUser = await User.findByIdAndUpdate(userData?.id, updateData, {
          new: false,
          runValidator: true,
        });

      } else {
        throw new AppError('Your code is invalid', 500);
      }
    } catch (error) {
      next(error);
    }
  },

  async loginUser(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400);
      }

      const token = await UserService.loginUser(req.body.email, req.body.password);
      if (!token) {
        throw new AppError('Invalid credentials', 401);
      }

      const userData = await UserService.findUserByEmail(req.body.email);
      userData.password = undefined;
      res.json({ token, data: userData });
    } catch (error) {
      next(error);
    }
  },

  async protectedRoute(req, res) {
    res.json({ message: 'You have access to this protected route' });
  },
};

module.exports = UserController;
