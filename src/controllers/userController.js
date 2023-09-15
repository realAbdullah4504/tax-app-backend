const { validationResult } = require('express-validator');
const AppError = require('../errors/AppError');
const UserService = require('../services/userService');

const UserController = {
  async registerUser(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400);
      }

      await UserService.registerUser({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
      });

      res.json({ message: 'User registered successfully' });
    } catch (error) {
      next(error);
    }
  },

  async loginUser(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400);
      }

      const token = await UserService.loginUser(req.body.email, req.body.password);
      if (!token) {
        throw new AppError('Invalid credentials', 401);
      }

      res.json({ token });
    } catch (error) {
      next(error);
    }
  },

  async protectedRoute(req, res) {
    res.json({ message: 'You have access to this protected route' });
  },
};

module.exports = UserController;
