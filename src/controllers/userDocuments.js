const userDocumentService = require("../services/userDocumentService");
const sendAppResponse = require("../utils/helper/appResponse");
exports.fileUpload = async (req, res, next) => {
    await userDocumentService.userUploadDocument(req, res);
  };
  exports.fileUploadA2 = async (req, res, next) => {
    await userDocumentService.userUploadA2Document(req, res);
  }; 
  exports.getA2File = async (req, res, next) => {
    try {
      const userId = req?.user?._id;
      const filename = `A2-${userId}`
      await userDocumentService.getUserFileByName(res, filename, userId);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error retrieving user file information" });
    }
  };
  exports.getDocuments = async (req, res, next) => {
    try {
      const {user}=req.query;
      const userId=user ||req.user._id;
      const resp = await userDocumentService.getUserFiles(userId);
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
    try {
      const filename = req.params.filename;
    const userId = req?.user?._id;
    await userDocumentService.getUserFileByName(res, filename, userId);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error retrieving user file information" });
    }
    
  };
  
  exports.deleteFile= async (req, res, next) => {
    const objectKey = req.params.filename;
    const userId = req?.user?._id;
    await userDocumentService.deleteFile(res,objectKey,userId);
  }


  