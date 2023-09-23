const mongoose = require('mongoose');
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
