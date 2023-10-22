const express = require("express");
const UserController = require("../controllers/userController");
const AuthController = require("../controllers/authController");
const taxRatesController = require("../controllers/taxRatesController");
const PdfParserController = require("../controllers/pdfParserController");
const { authenticate } = require("../middlewares/auth");
const { pdfParser, fileUpload, getDocuments, downloadFile } = PdfParserController;
const { signUp, verifyCode, login, resendCode, forgetPassword, resetPassword } =
  AuthController;
const { getUserDetail, updateUserDetail } = UserController;
const { taxRates, taxCalculations } = taxRatesController;
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
router.post("/taxRates", taxRates);
router.post("/calculateTax", authenticate, taxCalculations);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // limit file size to 5MB
  },
});

router.post("/fileUpload", authenticate, upload.single("file"), fileUpload);
router.get("/getDocuments", authenticate, getDocuments);
router.get("/downloadFile/:filename", downloadFile);
// Protected route using the authenticate middleware

module.exports = router;
