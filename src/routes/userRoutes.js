const express = require('express');
const UserController = require('../controllers/userController');
const AuthController = require('../controllers/authController');
const taxRatesController = require('../controllers/taxRatesController');
const PdfParserController = require('../controllers/pdfParserController');
const userDocumentService = require('../controllers/userDocuments');
const { authenticate } = require('../middlewares/auth');
const { pdfParser } = PdfParserController;
const { fileUpload, fileUploadA2, getA2File, getDocuments, downloadFile, deleteFile } =
  userDocumentService;

const { signUp, verifyCode, login, resendCode, forgetPassword, resetPassword,memberResetPassword } = AuthController;
const { getUserProfile,getUserDetail, updateUserDetail,getUsersList,getUserQuestionsDetail,deleteMember,updateUserProfile,blockUser,createMember,updateMember,assignMemberOrStage,deleteUser   downloadSignedPDF
} = UserController;
const { taxRates, taxCalculations, getCalculations,updateDefaultTaxValues } = taxRatesController;
const {
  createUserValidator,
  verifyCodeValidator,
  loginUserValidator,
  blockUserValidator,
  createMemberValidator,
  updateMemberValidator
} = require('../middlewares/validators');

const router = express.Router();

const multer = require('multer');

router.post('/register', createUserValidator, signUp);
router.post('/verify-code', [authenticate, verifyCodeValidator], verifyCode);
router.post('/resend-code', authenticate, resendCode);
router.post('/login', loginUserValidator, login);
router.post('/forgetPassword', forgetPassword);
router.patch('/resetPassword/:token', resetPassword);
router.post('/resetMemberPassword', authenticate, memberResetPassword);
router.post("/register", createUserValidator, signUp);
router.post("/verify-code", [authenticate, verifyCodeValidator], verifyCode);
router.post("/resend-code", authenticate, resendCode);
router.post("/login", loginUserValidator, login);
router.post("/forgetPassword", forgetPassword);
router.patch("/resetPassword/:token", resetPassword);
router.post("/member/resetMemberPassword",authenticate, memberResetPassword);

// User
router.get('/detail', authenticate, getUserProfile);
router.get('/:userId/questions', authenticate, getUserQuestionsDetail);
router.post('/pdf/:docType', authenticate, pdfParser);
router.post('/update', authenticate, updateUserDetail);
router.post('/taxRates', authenticate, taxRates);
router.post('/calculateTax', authenticate, taxCalculations);
router.post('/getCalculationDetails', authenticate, getCalculations);
router.put('/defaultTaxValues/:year', authenticate, updateDefaultTaxValues);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // limit file size to 5MB
  },
});
router.get('/A2File', authenticate, getA2File);
router.post('/upload/A2File', authenticate, upload.single('file'), fileUploadA2);
// Update the route to use `upload.array` for handling multiple files
router.post('/fileUpload', authenticate, upload.array('files', 5), fileUpload);
router.post('/block', [authenticate, blockUserValidator], blockUser);
router.get('/getDocuments', authenticate, getDocuments);
router.get('/downloadFile/:filename', authenticate, downloadFile);
router.delete('/deleteFile/:filename', authenticate, deleteFile);
router.get('/:id', authenticate, getUserDetail);
router.put('/:id', authenticate, updateUserProfile);
router.delete('/:id', authenticate, deleteUser);
router.get('/', authenticate, getUsersList);
router.post("/fileUpload", authenticate, upload.array("files", 5), fileUpload);
router.put("/member/:id/block",[authenticate,blockUserValidator],blockUser);
router.post("/member/assign",authenticate,assignMemberOrStage);
router.post("/member",[authenticate,createMemberValidator],createMember);
router.put("/member/:id",[authenticate,updateMemberValidator],updateMember);
router.delete("/member/:id",authenticate,deleteMember);
router.get("/getDocuments", authenticate, getDocuments);
router.get("/downloadFile/:filename",authenticate, downloadFile);
router.delete("/deleteFile/:filename",authenticate, deleteFile);
router.get("/:id",authenticate,getUserDetail);
router.put("/:id",authenticate,updateUserProfile);
router.get("/",authenticate,getUsersList);
router.get('/download-sign-pdf', authenticate, downloadSignedPDF);
// Protected route using the authenticate middleware

module.exports = router;
