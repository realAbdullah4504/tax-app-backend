const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const UserService = require('../services/userService');
const AppError = require('../errors/AppError');
const { validationResult } = require('express-validator');
const { JWT_SECRET, JWT_COOKIE_EXPIRE_IN, NODE_ENV } = require('../../config/vars');
const sendAppResponse = require("../utils/helper/appResponse");

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '2d',
  });
};

const createSendToken = (user, statusCode, res, msg = '') => {
  console.log("createSendToken func call!", user)
  if (!user) throw new AppError('Something went wrong', 500);

  const token = generateToken(user?._id);
  const cookieOptions = {
    expiresIn: new Date(
      Date.now() + JWT_COOKIE_EXPIRE_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;

  sendAppResponse({
    res,
    token,
    statusCode,
    status: "success",
    data: user,
    message: msg
  })
};

exports.sendTokenToClient = async (req, res, next) => {
  createSendToken(req, res, next);
};

exports.signUp = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }
    const { email, phoneNumber } = req.body;
    const existUser = await UserService.userExists({ email, phoneNumber });
    if (existUser) sendAppResponse({ res, statusCode: 200, status: 'success', message: 'User already register.' })
    const userData = await UserService.registerUser(req.body);
    // Send SMS code to mobile number and save reg record into db
    await UserService.sendVerificationCode(phoneNumber);

    const respMsg = 'Registration is successful! Please activate your account using the verification code sent to your registered phone number';
    createSendToken(userData, 200, res, respMsg);
  } catch (error) {
    next(error);
  }
};

exports.verifyCode = async (req, res, next) => {
  try {
    const { code } = req.body;
    const user = req.user;
    const userData = await UserService.findUserById(user._id);
    const isValid = userData?.verificationCode === parseInt(code);
    if (!isValid) throw new AppError('Your code is invalid', 500);
    const updateData = { verificationCode: null, active: true };
    // update the current user data
    await User.findByIdAndUpdate(userData?.id, updateData, {
      new: false,
      runValidator: true,
    });
    sendAppResponse({ res, statusCode: 200, status: 'success', message: 'Your account has been active successfully.' });
  } catch (error) {
    next(error);
  }
}

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const { email, password } = req.body;

    const user = await UserService.loginUser(email, password);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = generateToken(user?._id);
    user.password = undefined;
    sendAppResponse({ res, statusCode: 200, status: 'success', token, data: user });
  } catch (error) {
    next(error);
  }
};

