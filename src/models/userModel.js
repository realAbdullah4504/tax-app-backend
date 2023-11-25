const mongoose = require('mongoose');
const crypto = require("crypto");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../config/vars');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
  },
  surName: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
  },
  phoneNumber: {
    type: String,
  },
  password: {
    type: String,
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false,
  },
  userType: {
    type: String,
    enum: ['member', 'customer'],
    required: true
  },
  stage:{
    type:String,
    default:""
  },
  role:{
    type:String
  },
  tob:{
    type: Boolean,
  },
  taxAgent:{
    type: Boolean,
  },
  isActive: {
    type: Boolean,
    default: false
  },
  is2FA: {
    type: Boolean,
    default: false
  },
  passwordResetToken: String,
  passwordResetExpiry: Date,
},{
   timestamps: true
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
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpiry = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
const User = mongoose.model('User', userSchema);

module.exports = User;
