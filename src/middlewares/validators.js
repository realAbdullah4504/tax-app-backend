const { body } = require('express-validator');

const createUserValidator = [
  body('firstName').notEmpty().withMessage('First Name is required'),
  body('surName').notEmpty().withMessage('Sur Name is required'),
  body('email').isEmail().withMessage('Invalid email address'),
  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone Number is required')
    // .matches(/^(?:\+92|0092|0)?(?:3[0-5][0-9]{8})$/)//for pakistani phone number
    .matches(/^(?:\+353|0353|0)?(?:[0-9]{9})$/) //for irish phone number
    .withMessage('Invalid Pakistani phone number'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('tob').notEmpty().isBoolean().withMessage('Term & conditions are required to check'),
  body('taxAgent').notEmpty().isBoolean().withMessage('Tax Agent is required'),
];

const verifyCodeValidator = [
  body('code')
    .isLength({ min: 6, max: 6 })
    .withMessage('Verification code must be 6 characters long'),
];

const loginUserValidator = [
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
];

module.exports = {
  createUserValidator,
  verifyCodeValidator,
  loginUserValidator,
};
