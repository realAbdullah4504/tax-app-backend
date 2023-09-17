const express = require('express');
const { createUserValidator, verifyCodeValidator, loginUserValidator } = require('../middlewares/validators');
const UserController = require('../controllers/userController');
const { authenticate } = require('../middlewares/auth');
const cryptoService = require('../services/cryptoService');

const router = express.Router();

router.post('/register', createUserValidator, UserController.registerUser);
router.post('/verify-code', [authenticate, verifyCodeValidator], UserController.verifyCode);
router.post('/login', [authenticate, loginUserValidator], UserController.loginUser);


// Protected route using the authenticate middleware
router.get('/protected', authenticate, UserController.protectedRoute);

module.exports = router;
