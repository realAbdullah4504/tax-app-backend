const FamilyDetailService = require("../services/familyDetailService");
const sendAppResponse = require("../utils/helper/appResponse");

/**
 * @GET
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * get user family detail api controller
 */
exports.getUserFamilyDetail = async (req, res, next) => {
    try {
      const {userId}=req.params;
      const details = await FamilyDetailService.fetchUserFamilyDetail(userId);
      sendAppResponse({
        res,
        data:details,
        statusCode: 200,
        status: "success",
        message: "User family detail fetched successfully.",
      });
    } catch (error) {
      next(error);
    }
  };