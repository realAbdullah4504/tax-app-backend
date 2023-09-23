const User = require("../models/userModel");
const UserService = require('../services/userService');
const AppError = require('../errors/AppError');
const { JWT_SECRET, JWT_COOKIE_EXPIRE_IN, NODE_ENV } = require('../../config/vars');
const sendAppResponse = require("../utils/helper/appResponse");
// getSchemeHelper 

exports.getUserDetail = async (req, res, next) => {
  try {
  // fetch from personal info scheme
  // fetch from family scheme
  // fetch from health scheme
    const userDetail = {
      personalInfo: personalInfo || {},


    }
    sendAppResponse({ res, statusCode: 200, status: 'success', message: 'Your account has been active successfully.' });
  } catch (error) {
    next(error);
  }
};
exports.updateUserDetail = async (req, res, next) => {
  try {
    const user = req.user;
    const type = req.body.type;
    let payload = req.body;
    // select scheme on the basis of type
    //getSchemeHelper
    // delete type from payload
    // payload user add from 
    payload.userId = user?.id;
    // Model.createAndUpdate(id, payload)
    const userDetail = {
      personalInfo:{},

      
    }
    sendAppResponse({ res, statusCode: 200, status: 'success', message: 'Your account has been active successfully.' });
  } catch (error) {
    next(error);
  }
};