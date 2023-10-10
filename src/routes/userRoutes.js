const express = require('express');
const UserController = require('../controllers/userController');
const AuthController = require('../controllers/authController');
const taxRatesController = require("../controllers/taxRatesController");
const PdfParserController = require('../controllers/pdfParserController');
const { authenticate } = require('../middlewares/auth');
const { pdfParser } = PdfParserController;
const { signUp, verifyCode, login, resendCode } = AuthController;
const { getUserDetail, updateUserDetail } = UserController;
const { taxRates, taxCalculations } = taxRatesController;
const { createUserValidator, verifyCodeValidator, loginUserValidator } = require('../middlewares/validators');
const router = express.Router();

router.post('/register', createUserValidator, signUp);
router.post('/verify-code', [authenticate, verifyCodeValidator], verifyCode);
router.post('/resend-code', authenticate, resendCode);
router.post('/login', loginUserValidator, login);

// User
router.get("/detail", authenticate, getUserDetail);
router.post("/pdf/:docType", authenticate, pdfParser);
router.post("/update", authenticate, updateUserDetail);
router.post("/taxRates", taxRates);
router.post("/calculateTax",authenticate, taxCalculations);
// Protected route using the authenticate middleware

module.exports = router;
