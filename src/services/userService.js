const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../config/vars');

const UserService = {
  async registerUser(userData) {
    const user = new User(userData);
    await user.save();
  },

  async findUserByEmail(email) {
    return User.findOne({ email }).select('+password');
  },

  async authenticateUser(email, password) {
    const user = await this.findUserByEmail(email);
    if (!user || !(await user.isValidPassword(password))) {
      return null;
    }
    return user;
  },

  generateToken(user) {
    return user.generateToken();
  },

  async loginUser(email, password) {
    try {
      const user = await this.authenticateUser(email, password);
      if (!user) {
        return null;
      }

      const token = this.generateToken(user);
      return token;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = UserService;
