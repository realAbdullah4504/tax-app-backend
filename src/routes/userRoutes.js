const express = require('express');
const { createUserValidator, verifyCodeValidator, loginUserValidator } = require('../middlewares/validators');
const UserController = require('../controllers/userController');
const AuthController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const cryptoService = require('../services/cryptoService');
const { signUp } = AuthController;
const router = express.Router();
router.get('/',(req,res, next)=>{
    res.status(200).json({ message: "A message from server." })
  });
router.post('/register', signUp);
router.post('/verify-code', [authenticate, verifyCodeValidator], UserController.verifyCode);
router.post('/login', [authenticate, loginUserValidator], UserController.loginUser);


// Protected route using the authenticate middleware
router.get('/protected', authenticate, UserController.protectedRoute);

module.exports = router;
