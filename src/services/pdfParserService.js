const mindee = require("mindee");
const { PDF_PARSER, PDF_API_EMP, PDF_ACC } = require("../../config/vars");
const mindeeClient = new mindee.Client({ apiKey: PDF_PARSER });

const getApiEndPoint = (type) => {
  switch (type) {
    case "employment-summery":
      return "eds";
    default:
      throw new Error("Invalid type");
  }
};

const pdfParserService = {
  async pdfEndPoints(docType) {
    try {
      const apiPath = getApiEndPoint(docType);
      const customEndpoint = mindeeClient.createEndpoint(apiPath, PDF_ACC);
      return customEndpoint;
    } catch (error) {
      throw error;
    }
  },

  async inputSource(file, fileName) {
    try {
      const inputSource = mindeeClient.docFromBase64(file, fileName);
      return inputSource;
    } catch (error) {
      throw error;
    }
  },

  async parsePDF(inputSource, customEndpoint) {
    try {
      const apiResponse = mindeeClient.parse(mindee.product.CustomV1, inputSource, {
        endpoint: customEndpoint,
        cropper: true,
      });
      return apiResponse;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = pdfParserService;
