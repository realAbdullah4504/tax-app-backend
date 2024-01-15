const User = require("../models/userModel");
const TaxDefaultValuesModel = require("../models/taxDefaultValuesModel");
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
    if (req.body.signature && !req.body.signature.startsWith('data:image/png;base64,')) {
      throw new AppError('Invalid signature data. Expected base64-encoded PNG image.',500);
    }
    if(req.body.signature){
      const signatureData = req?.body?.signature && req?.body?.signature.replace(
        'data:image/png;base64,',
        ''
      );
      req.body.signature = signatureData
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
 * @Delete
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * delete user by id
 */

exports.deleteMember = async (req, res, next) => {
  try {
    const {ids,adminPassword}=req.body;
    const {role,email}=req.user;
      if(!["admin","supervisor"].includes(role)){
        throw new AppError('you are not authorize to add member', 403);
      }
    const user = await UserService.authenticateUser(email,adminPassword);
      if (!user) {
        throw new AppError('admin password does not match', 403);
      }
  await UserService.deleteUsers(ids);
    sendAppResponse({
      res,
      data:{},
      statusCode: 200,
      status: "success",
      message: "Users Deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * create member
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

exports.createMember = async(req,res,next)=>{
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      throw new AppError(JSON.stringify(result.errors), 400);
    }
    const existUser = await UserService.userExists({ email:req.body.email });
    if (existUser){
      sendAppResponse({
        res,
        statusCode: 400,
        status: 'fail',
        message: 'Member already registered with this email',
      });
      return
    }


    const payload={
      ...req.body,
      userType:'member',
      tob: false,
      taxAgent: false,
    }
    const user = await UserService.registerUser(payload)
    sendAppResponse({
      res,
      data:user,
      statusCode: 200,
      status: "success",
      message: "member added successfully",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * update member
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

exports.updateMember = async(req,res,next)=>{
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      throw new AppError(JSON.stringify(result.errors), 400);
    }
    const {role}=req.user;
    if(!["admin","supervisor"].includes(role)){
      throw new AppError('you are not authorize to update member', 403);
    }

    const id = req.params.id;
    //check should be made whether subtype is number or string it fails to update the result when we post the number but it treated as string
    const payload = {};
    const data = req.body;
    for (const key in data) {
      const value = data[key];
      if (!isNaN(value) && !Array.isArray(value) && typeof value!=="boolean") {
        payload[key] = +value;
      } else {
        payload[key] = value;
      }
    }
    delete payload.password;
    const updatedUser = await UserService.updatedUser({id,data:payload});
    sendAppResponse({
      res,
      data:updatedUser,
      statusCode: 200,
      status: "success",
      message: "member updated successfully",
    });
  } catch (error) {
    next(error);
  }
}



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
    if(!['admin','supervisor'].includes(req.user.role)){
      throw new AppError('you are not authorized to block user', 403);
    }
    const {status}=req.body;
     await UserService.blockUser(status,req.params.id);
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

/**
 * assing stage or member
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.assignMemberOrStage =async (req, res, next)=>{
  try {
    const {ids,...data}=req.body;
    await UserService.assignMemberOrStage(ids,data);
    sendAppResponse({
      res,
      data:{},
      statusCode: 200,
      status: "success",
      message: "members details has been updated",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * assign stage only
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.assignStage =async (req, res, next)=>{
  try {
    // if(!['admin','supervisor'].includes(req.user.role)){
    //   throw new AppError('you are not authorized to assing member or stage', 403);
    // }
    const {ids,...data}=req.body;
    await UserService.assignMemberOrStage(ids,data);
    sendAppResponse({
      res,
      data:{},
      statusCode: 200,
      status: "success",
      message: "members details has been updated",
    });
  } catch (error) {
    next(error);
  }
}

exports.downloadSignedPDF = async (req, res) => {
  try {
    const {userId} = req?.query;
    const signedPDF = await UserService.getSignedPDF(userId);
    res.setHeader('Content-Disposition', 'attachment; filename=download.pdf');
    res.setHeader('Content-Type', 'application/pdf');
    res.send(Buffer.from(signedPDF));
  } catch (error) {
    console.error(error);
    console.error(error.message);
    throw AppError('Internal Server Error', 500);
  }
}
exports.getDefaultTaxValues = async (req, res) => {
  try {
    const data = await TaxDefaultValuesModel.find();
    sendAppResponse({
      res,
      data,
      statusCode: 200,
      status: "success",
      message: "",
    });
  } catch (error) {
    console.error(error.message);
    throw new AppError('Internal Server Error', 500);
  }
}


exports.getStudents = async (req, res, next) => {
  try {
    const user = req.user;
    const data = await UserService.getStudentsList(user?._id);
    sendAppResponse({
      res,
      data,
      statusCode: 200,
      status: "success",
      message: "Students List fetched successfully.",
    });
  } catch (error) {
    next(error);
  }
};
