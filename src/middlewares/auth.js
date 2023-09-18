const jwt = require('jsonwebtoken');
const AppError = require('../errors/AppError');
const { JWT_SECRET } = require('../../config/vars');
const UserService = require('../services/userService');
const User = require('../models/userModel');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decodedToken = jwt.verify(token, JWT_SECRET);
    console.log("Token is ==> ", token);

    console.log(JWT_SECRET, "decodedToken ", decodedToken);

    if (!decodedToken) {
      throw new AppError('Not authorized', 401);
    }

    const user = await UserService.findUserById(decodedToken.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticate,
};
