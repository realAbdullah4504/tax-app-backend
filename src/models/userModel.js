const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require("validator");
const { JWT_SECRET } = require('../../config/vars');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    // required: [true, "please provide your first name."],
  },
  surName: {
    type: String,
    // required: [true, "please provide your surname."],
  },
  email: {
    type: String,
    unique: true,
    // required: [true, "please provide your email."],
    lowercase: true,
    // validate: [validator.isEmail, "please provide a valid email."],
  },
  phoneNumber: {
    type: String,
    // required: [true, "please provide your phone."],
  },
  password: {
    type: String,
    // required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false,
  },
  verificationCode: {
    type: Number,
    default: null,
  },
  tob:{
    type: Boolean,
    // required: [true, "please provide tob"],
  },
  taxAgent:{
    type: Boolean,
    // required: [true, "please provide tob"],
  },
  isActive: {
    type: Boolean,
    required: [true, '2FA with SMS is required'],
    default: false
  },
});

// Password hashing pre hook
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Password validation method
userSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// userSchema.pre(/^find/, function (next) {
//   this.find({isActive :{$ne:false}})
//   next()
// });

// Token generation method
userSchema.methods.generateToken = function () {
  return jwt.sign({ _id: this._id.toString() }, JWT_SECRET, { expiresIn: '1h' });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
