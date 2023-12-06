const User = require("../models/userModel");
const { validationResult } = require('express-validator');
const AppError = require('../errors/AppError'); 
const UserService = require("../services/userService");
const sendAppResponse = require("../utils/helper/appResponse");

exports.getUserProfile = async (req, res, next) => {
  try {
    const user = req.user;
    const userDetail = await UserService.getCurrentUserDetail(user?._id);
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
    const { type, userInfo, ...restPayload } = req.body;
    const id = req?.body?.userId ? req?.body?.userId : req?.user?.id;
    //check should be made whether subtype is number or string it fails to update the result when we post the number but it treated as string
    const payload = {};
    for (const key in restPayload) {
      const value = restPayload[key];
      if (!isNaN(value) && !Array.isArray(value) && typeof value!=="boolean") {
        payload[key] = +value;
      } else {
        payload[key] = value;
      }
    }
    if(req?.body?.userId){
    const updatedUserInfo = await UserService.updateCurrentUser(id, "user", userInfo);
    }
    const updatedUser = await UserService.updateCurrentUser(id, type, payload);
    sendAppResponse({
      res,
      updatedUser,
      statusCode: 200,
      status: "success",
      message: "User updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @GET
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * Get registered users list
 */

exports.getUsersList = async (req, res, next) => {
  try {
    const {type}=req.query;
    const users = await UserService.fetchUsersList(type,req.query);
    sendAppResponse({
      res,
      data:users,
      statusCode: 200,
      status: "success",
      message: "Users list",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user detail
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.getUserDetail = async (req, res, next) => {
  try {
    const {id}=req.params;
    const {personalDetail}=req.query;
    const user = await UserService.fetchUserDetail(id,personalDetail);
    sendAppResponse({
      res,
      data:user,
      statusCode: 200,
      status: "success",
      message: "User details",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @GET
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * 
 * controller function to get user detail home|health|family
 */
exports.getUserQuestionsDetail = async (req, res, next) => {
  try {
    const {type}=req.query;
    const {userId}=req.params;
    const detail = await UserService.fetchUserQuestionsDetail(type,userId);
    const user = await User.findOne({_id: userId});
    sendAppResponse({
      res,
      data:detail,
      userInfo:user || {},
      statusCode: 200,
      status: "success",
      message: "User details",
    });
  } catch (error) {
    next(error);
  }
};



/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.updateUserProfile = async (req, res, next) => {
  try {
    const id = req.params.id;
    //check should be made whether subtype is number or string it fails to update the result when we post the number but it treated as string
    const payload = {};
    const data=req.body;
    for (const key in data) {
      const value = data[key];
      if (!isNaN(value) && !Array.isArray(value) && typeof value!=="boolean") {
        payload[key] = +value;
      } else {
        payload[key] = value;
      }
    }
  
    const updatedUser = await UserService.updatedUser({id,data:payload});
    sendAppResponse({
      res,
      updatedUser,
      statusCode: 200,
      status: "success",
      message: "User updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @Delete
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * delete user by id
 */

exports.deleteUser = async (req, res, next) => {
  try {
    const {id}=req.params;
     await UserService.deleteUser(id);
    sendAppResponse({
      res,
      data:{},
      statusCode: 200,
      status: "success",
      message: "User Deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * block user
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.blockUser =async (req, res, next)=>{
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      throw new AppError(JSON.stringify(result.errors), 400);
    }
    const {status,userId}=req.body;
     await UserService.blockUser(status,userId);
    sendAppResponse({
      res,
      data:{},
      statusCode: 200,
      status: "success",
      message: "User blocked status updated",
    });
  } catch (error) {
    next(error);
  }
}




