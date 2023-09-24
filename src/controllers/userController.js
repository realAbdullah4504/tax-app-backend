const UserService = require("../services/userService");
const sendAppResponse = require("../utils/helper/appResponse");

exports.getUserDetail = async (req, res, next) => {
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
    const { type, ...restPayload } = req.body;
    const id = req?.user?.id;
    //check should be made whether subtype is number or string it fails to update the result when we post the number but it treated as string
    const payload = {};
    for (const key in restPayload) {
      if (!isNaN(restPayload[key])) {
        payload[key] = +restPayload[key];
      } else {
        payload[key] = restPayload[key];
      }
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
