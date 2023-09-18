const express = require('express');
const UserController = require('../controllers/userController');
const AuthController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const { signUp, verifyCode } = AuthController;
const { createUserValidator, verifyCodeValidator, loginUserValidator } = require('../middlewares/validators');
const router = express.Router();

router.post('/register', createUserValidator, signUp);
router.post('/verify-code', [authenticate, verifyCodeValidator], verifyCode);
router.post('/login', loginUserValidator, UserController.loginUser);


// Protected route using the authenticate middleware
router.get('/protected', authenticate, UserController.protectedRoute);

module.exports = router;
