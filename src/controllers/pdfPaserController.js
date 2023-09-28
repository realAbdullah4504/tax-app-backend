const pdfParserService = require("../services/pdfParserService");
const sendAppResponse = require("../utils/helper/appResponse");
exports.pdfParser = async (req, res, next) => {
  try {
    let data = {};
    const { fileString, docType } = req.body;
    const endPoint = await pdfParserService.pdfEndPoints(docType);
    const source = await pdfParserService.inputSource(fileString, docType);
    const pdfData = await pdfParserService.parsePDF(source, endPoint);
    const fields = pdfData?.document?.inference?.prediction?.fields;
    fields.forEach((element, key) => {
      data[key] = element.values.join(" ");
    });

    console.log(data);
    sendAppResponse({
      res,
      data,
      statusCode: 200,
      status: "success",
      message: "PDF parser executed.",
    });
  } catch (error) {
    next(error);
  }
};
