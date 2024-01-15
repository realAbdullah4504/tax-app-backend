const { body } = require('express-validator');

const createUserValidator = [
  body('firstName').notEmpty().withMessage('First Name is required'),
  body('surName').notEmpty().withMessage('Sur Name is required'),
  body('email').isEmail().withMessage('Invalid email address'),
  body('phoneNumber').notEmpty().withMessage('Phone Number is required'),
  // .matches(/^(?:\+92|0092|0)?(?:3[0-5][0-9]{8})$/)//for pakistani phone number
  // .matches(/^(?:\+353|0353|0)?(?:[0-9]{9})$/) //for irish phone number
  // .withMessage('Invalid Pakistani phone number'),
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

const blockUserValidator = [
  body('status')
    .notEmpty()
    .withMessage('block status is required')
    .isIn(['blocked', 'unBlock'])
    .withMessage('block status must be [block|unBlock]'),
];

const createMemberValidator = [
  body('firstName').notEmpty().withMessage('First Name is required'),
  body('surName').notEmpty().withMessage('Sur Name is required'),
  body('email').isEmail().withMessage('Invalid email address'),
  body('phoneNumber').notEmpty().withMessage('Phone Number is required'),
  // .matches(/^(?:\+92|0092|0)?(?:3[0-5][0-9]{8})$/)//for pakistani phone number
  // .matches(/^(?:\+353|0353|0)?(?:[0-9]{9})$/) //for irish phone number
  // .withMessage('Invalid Pakistani phone number'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role')
    .notEmpty()
    .withMessage('role is required')
    .isIn(['call_center', 'staff_member', 'supervisor', 'support','admin'])
    .withMessage('role must be [call_center |staff_member|supervisor|support]'),
];

const updateMemberValidator = [
  body('firstName').notEmpty().withMessage('First Name is required'),
  body('surName').notEmpty().withMessage('Sur Name is required'),
  body('email').isEmail().withMessage('Invalid email address'),
  body('phoneNumber').notEmpty().withMessage('Phone Number is required'),
  // .matches(/^(?:\+92|0092|0)?(?:3[0-5][0-9]{8})$/)//for pakistani phone number
  // .matches(/^(?:\+353|0353|0)?(?:[0-9]{9})$/) //for irish phone number
  // .withMessage('Invalid Pakistani phone number'),
  body('role')
    .notEmpty()
    .withMessage('role is required')
    .isIn(['call_center', 'staff_member', 'supervisor', 'support'])
    .withMessage('role must be [call_center |staff_member|supervisor|support]'),
];

module.exports = {
  createUserValidator,
  verifyCodeValidator,
  loginUserValidator,
  blockUserValidator,
  createMemberValidator,
  updateMemberValidator,
};
