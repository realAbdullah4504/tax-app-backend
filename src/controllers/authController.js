const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const UserService = require('../services/userService');
const AppError = require('../errors/AppError');
const { validationResult } = require('express-validator');
const { JWT_SECRET, JWT_COOKIE_EXPIRE_IN, NODE_ENV, FORGET_PASSWORD_ROUTE } = require('../../config/vars');
const sendAppResponse = require('../utils/helper/appResponse');
const emailService = require('../services/emailService');
const { TokenFileWebIdentityCredentials } = require('aws-sdk');

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '2d',
  });
};

const createSendToken = (user, statusCode, res, msg = '') => {
  if (!user) throw new AppError('Something went wrong', 500);

  const token = generateToken(user?._id);
  const cookieOptions = {
    expiresIn: new Date(Date.now() + JWT_COOKIE_EXPIRE_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  if (NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;

  sendAppResponse({
    res,
    token,
    statusCode,
    status: 'success',
    data: user,
    message: msg,
  });
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
    if (existUser)
      sendAppResponse({
        res,
        statusCode: 400,
        status: 'fail',
        message: 'User has already registered.',
      });
    const userData = await UserService.registerUser(req.body);
    // Send SMS code to mobile number and save reg record into db
    await UserService.sendVerificationCode(phoneNumber);

    const respMsg =
      'Registration is successful! Please activate your account using the verification code sent to your registered phone number';
    createSendToken(userData, 200, res, respMsg);
  } catch (error) {
    next(error);
  }
};

exports.verifyCode = async (req, res, next) => {
  try {
    const { code } = req.body;
    const user = req.user;
    if (!user) throw new AppError('Your token is invalid or expired', 500);
    await UserService.VerifyUserCode(user?.phoneNumber, code);

    const updateData = { isActive: true };
    // update the current user data
    await User.findByIdAndUpdate(user?.id, updateData, {
      new: false,
      runValidator: true,
    });
    sendAppResponse({
      res,
      statusCode: 200,
      status: 'success',
      message: 'Your account has been active successfully.',
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const { email, password } = req.body;
    const user = await UserService.loginUser(email, password);
    if (!user) throw new AppError('Invalid credentials', 400);
    if(user.isBlocked){
      throw new AppError('user has been blocked', 403);
    }
    const token = generateToken(user?._id);
    user.password = undefined;
    if (user?.is2FA) await UserService.sendVerificationCode(user?.phoneNumber);
    const message = user?.is2FA ? 'code has been sent to your phone number to log in' : '';
    sendAppResponse({ res, statusCode: 200, status: 'success', token, data: user, message });
  } catch (error) {
    next(error);
  }
};

exports.resendCode = async (req, res, next) => {
  try {
    const user = req.user;
    if (user) await UserService.sendVerificationCode(user?.phoneNumber);
    sendAppResponse({ res, statusCode: 200, status: 'success', message: 'New code has been sent' });
  } catch (error) {
    next(error);
  }
};
exports.forgetPassword = async (req, res, next) => {
  try {
    const baseUrl = `${req.protocol}://${FORGET_PASSWORD_ROUTE}`;


    const resetTokenUrl = await UserService.forgotPasswordUser(req?.body?.email, baseUrl);
    
    const info = await emailService(resetTokenUrl,req?.body?.email);
    // console.log(resetTokenUrl);
    res.status(200).json({ status: 'success', resetTokenUrl,info});
  } catch (error) {
    next(error);
  }
};
exports.resetPassword = async (req, res, next) => {
  try {
    const token = req.params.token;
    const { password, confirmPassword } = req.body;
    // console.log('token', token)
    const resp = await UserService.resetPasswordUser(token, password, confirmPassword);

    // 4 log the user in, send jwt
    createSendToken(resp, 201, res);
  } catch (error) {
    next(error);
  }
};

/**
 * controller for resetting user password by admin
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

exports.memberResetPassword=async(req, res, next) =>{
  try {
    const {userId} = req.body;
    const {_id}=req.user;
    const newPassword = await UserService.resetMemberPassword(userId,_id);
    sendAppResponse({ res, statusCode: 200, status: 'success', message: 'user password reset successfully',newPassword });
  } catch (error) {
    next(error);
  }

}
