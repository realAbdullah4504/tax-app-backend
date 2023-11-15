const express = require("express");
const UserController = require("../controllers/userController");
const AuthController = require("../controllers/authController");
const taxRatesController = require("../controllers/taxRatesController");
const PdfParserController = require("../controllers/pdfParserController");
const userDocumentService = require("../controllers/userDocuments");
const familyDetailController = require("../controllers/familyDetailController");
const { authenticate } = require("../middlewares/auth");
const { pdfParser } = PdfParserController;
const { fileUpload, fileUploadA2, getA2File, getDocuments, downloadFile, deleteFile } = userDocumentService;

const { signUp, verifyCode, login, resendCode, forgetPassword, resetPassword } =
  AuthController;
const { getUserProfile,getUserDetail, updateUserDetail,getUsersList } = UserController;
const { taxRates, taxCalculations, getCalculations } = taxRatesController;
const {getUserFamilyDetail} = familyDetailController;
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
router.get("/",authenticate,getUsersList);
router.get("/detail", authenticate, getUserProfile);
router.get("/:userId/familyDetail", getUserFamilyDetail);
router.post("/pdf/:docType", authenticate, pdfParser);
router.post("/update", authenticate, updateUserDetail);
router.post("/taxRates", taxRates);
router.post("/calculateTax", authenticate, taxCalculations);
router.post("/getCalculationDetails", authenticate, getCalculations);
router.get("/:id",authenticate,getUserDetail);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // limit file size to 5MB
  },
});
router.get("/A2File", authenticate, getA2File);
router.post("/upload/A2File", authenticate, upload.single("file"), fileUploadA2);
// Update the route to use `upload.array` for handling multiple files
router.post("/fileUpload", authenticate, upload.array("files", 5), fileUpload);
router.get("/getDocuments", authenticate, getDocuments);
router.get("/downloadFile/:filename",authenticate, downloadFile);
router.delete("/deleteFile/:filename",authenticate, deleteFile);
// Protected route using the authenticate middleware

module.exports = router;
