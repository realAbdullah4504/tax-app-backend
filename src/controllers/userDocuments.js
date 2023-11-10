const userDocumentService = require("../services/userDocumentService");
const sendAppResponse = require("../utils/helper/appResponse");
exports.fileUpload = async (req, res, next) => {
    await userDocumentService.userUploadDocument(req, res);
  };
  
  exports.getDocuments = async (req, res, next) => {
    try {
      const resp = await userDocumentService.getUserFiles(req.user._id);
      sendAppResponse({
        res,
        data: resp,
        statusCode: 200,
        status: "success",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error retrieving user file information" });
    }
  };
  
  exports.downloadFile = async (req, res, next) => {
    const filename = req.params.filename;
    await userDocumentService.getUserFileByName(res, filename);
  };
  
  exports.deleteFile= async (req, res, next) => {
    const objectKey = req.params.filename;
    const userId = req?.user?._id;
    await userDocumentService.deleteFile(res,objectKey,userId);
  }