const pdfParserService = require("../services/pdfParserService");
const sendAppResponse = require("../utils/helper/appResponse");
const formidable = require("formidable");
const path = require("path");
const fs = require("fs");
const uploadDi = "src/uploads";

exports.pdfParser = async (req, res, next) => {
  try {
    let data = [];
    // let year;
    let tempArray = {};
    let fileString;
    const { docType } = req.params;

    const form = new formidable.IncomingForm();
    form.uploadDir = uploadDi;
    form.multiples = false;
    form.keepExtensions = true;
    form.maxFieldsSize = 10 * 1024 * 1024;

    form.parse(req, async (_err, fields, files) => {
      if (_err)
        sendAppResponse({
          res,
          _err,
          statusCode: 400,
          status: "failed",
          message: "file upload failed",
        });
    });

    form.on("file", async (name, file) => {
      fileString = await fs.readFileSync(file.filepath, { encoding: "base64" });
      const endPoint = await pdfParserService.pdfEndPoints(docType);
      const source = await pdfParserService.inputSource(fileString, docType);
      const pdfData = await pdfParserService.parsePDF(source, endPoint);
      const pdfPages = pdfData?.document?.inference?.pages;
      pdfPages.forEach((element, key) => {
        const pdfFields = element?.prediction?.fields;
        pdfFields.forEach((element, key) => {
          // if (key === "year") {
          //   year = element?.values.join(" ");
          // }
          tempArray[key] = element?.values.join(" ");
        });
        data.push(tempArray);
      });
      sendAppResponse({
        res,
        data,
        statusCode: 200,
        status: "success",
        message: "PDF Data Extracted successfully",
      });
    });

    // const { fileString, docType } = req.body;
    // const endPoint = await pdfParserService.pdfEndPoints("employment-summery");
    // const source = await pdfParserService.inputSource(fileString, docType);
    // const pdfData = await pdfParserService.parsePDF(source, endPoint);
    // const fields = pdfData?.document?.inference?.prediction?.fields;
    // fields.forEach((element, key) => {
    //   data[key] = element.values.join(" ");
    // });
    // console.log(fileString);
  } catch (error) {
    next(error);
  }
};
