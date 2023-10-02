const express = require("express");
const UserController = require("../controllers/userController");
const pdfParserController = require("../controllers/pdfParserController");
const AuthController = require("../controllers/authController");
const { authenticate } = require("../middlewares/auth");
const { signUp, verifyCode, login } = AuthController;
const { getUserDetail, updateUserDetail } = UserController;
const { pdfParser } = pdfParserController;
const {
  createUserValidator,
  verifyCodeValidator,
  loginUserValidator,
} = require("../middlewares/validators");
const router = express.Router();

router.post("/register", createUserValidator, signUp);
router.post("/verify-code", [authenticate, verifyCodeValidator], verifyCode);
router.post("/login", loginUserValidator, login);

// User
router.get("/detail", authenticate, getUserDetail);
router.post("/pdf/:docType", authenticate, pdfParser);
router.post("/update", authenticate, updateUserDetail);
// Protected route using the authenticate middleware

module.exports = router;
