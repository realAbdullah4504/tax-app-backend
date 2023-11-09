const express = require("express");
const UserController = require("../controllers/userController");
const AuthController = require("../controllers/authController");
const taxRatesController = require("../controllers/taxRatesController");
const PdfParserController = require("../controllers/pdfParserController");
const { authenticate } = require("../middlewares/auth");
const { pdfParser, fileUpload, getDocuments, downloadFile, deleteFile } = PdfParserController;
const { signUp, verifyCode, login, resendCode, forgetPassword, resetPassword } =
  AuthController;
const { getUserDetail, updateUserDetail, update2FA } = UserController;
const { taxRates, taxCalculations, getCalculations } = taxRatesController;
const {
  createUserValidator,
  verifyCodeValidator,
  loginUserValidator,
} = require("../middlewares/validators");
const router = express.Router();

const multer = require("multer");

router.post("/register", createUserValidator, signUp);
router.post("/verify-code", [authenticate, verifyCodeValidator], verifyCode);
router.post("/resend-code", authenticate, resendCode);
router.post("/login", loginUserValidator, login);
router.post("/forgetPassword", forgetPassword);
router.patch("/resetPassword/:token", resetPassword);

// User
router.get("/detail", authenticate, getUserDetail);
router.post("/pdf/:docType", authenticate, pdfParser);
router.post("/update", authenticate, updateUserDetail);
router.post("/2FA", authenticate, update2FA);
router.post("/taxRates", taxRates);
router.post("/calculateTax", authenticate, taxCalculations);
router.post("/getCalculationDetails", authenticate, getCalculations);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // limit file size to 5MB
  },
});

// Update the route to use `upload.array` for handling multiple files
router.post("/fileUpload", authenticate, upload.array("files", 5), fileUpload);
router.get("/getDocuments", authenticate, getDocuments);
router.get("/downloadFile/:filename", downloadFile);
router.delete("/deleteFile/:filename",authenticate, deleteFile);
// Protected route using the authenticate middleware

module.exports = router;
