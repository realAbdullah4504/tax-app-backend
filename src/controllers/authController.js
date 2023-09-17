const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const createAppError = require("../utils/helper/appError");
const User = require("../models/userModel");
const AppError = require('../errors/AppError');
const { JWT_SECRE, JWT_COOKIE_EXPIRE_IN, NODE_ENV } = require('../../config/vars');
const sendAppResponse = require("../utils/helper/appResponse");

const signUpToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '2d',
  });
};

exports.createSendToken = (user, statusCode, res, msg='') => {
  console.log("createSendToken func call!", user)
  if (!user) throw new AppError('Something went wrong', 500);

  const token = signUpToken(user?._id);
  const cookieOptions = {
    expiresIn: new Date(
      Date.now() + JWT_COOKIE_EXPIRE_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);
  // user.password = undefined;
  delete user?.password;

  sendAppResponse({
    res,
    token,
    statusCode,
    status: "success",
    data: user,
    message: msg
})

  // res.status(statusCode).json({
  //   status: "success",
  //   token,
  //   data: user,
  // });
};

// exports.signUp = async (user, statusCode, res) => {
//   try {
//     createSendToken(user, statusCode, res);
//   } catch (error) {
//     console.log("error ", error);
//     throw new AppError('Token generation failed', 201);
//   }
// };

exports.logIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // check if email and password exist
    if (!email || !password) {
      throw createAppError("Please provide email and password", 404);
    }

    // check if user exist and password is correct
    const user = await User.findOne({ email }).select("+password");
    const isCorrectPassword = await user.correctPassword(
      password,
      user?.password
    );

    if (!user || !isCorrectPassword) {
      throw createAppError("Incorrect email and password", 401);
    }

    // if everything is ok, send token to client
    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};
exports.authentication = async (req, res, next) => {
  try {
    let token;
    // 1) Getting token and check if it's there
    if (
      req?.headers?.authorization &&
      req?.headers?.authorization.startsWith("Bearer")
    ) {
      token = req?.headers?.authorization.split(" ")[1];
    }
    if (!token) {
      throw createAppError(
        "You are not logged in! so please login to get access",
        401
      );
    }
    // 2) Verification Token
    const decoded = jwt.verify(token, JWT_SECRET);
    // 3) check if user still exist
    const user = await User.findById(decoded.id);
    if (!user) {
      throw createAppError(
        "The user belonging to this token does no longer exist",
        401
      );
    }
    // 4) check if user changed password after the token was issued
    if (user.changePasswordAfter(decoded.iat)) {
      throw createAppError(
        "The user changed password. please login again",
        401
      );
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
exports.authorization = (roles) => {
  return (req, res, next) => {
    try {
      if (!roles.includes(req.user.role)) {
        throw createAppError(
          "You don't have permission to perform this action.",
          403
        );
      }
    } catch (error) {
      next(error);
    }
  };
};
exports.forgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw createAppError("There is no user with the email address.", 404);
    }
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forget your password submit a PATCH request with your new password and confirmPassword to: ${resetUrl}.\n if you didn't forget password, ignore this email`;
    //  try {
    //   await sendEmail({
    //     email,
    //     subject:'Your password reset token (valid 10 minutes)',
    //     message
    //   })
    //   res.status(200).json({
    //     statusCode: 200,
    //     status: 'success',
    //     resetToken,
    //   });
    //  } catch (err) {
    //   user.passwordResetToken = undefined;
    //   user.passwordResetExpiry = undefined;
    //   await user.save({ validateBeforeSave: false });
    //   throw createAppError('There is an error sending email. Try again', 500);
    //  return next(err)
    //  }
    res.status(200).json({ status: "success", resetToken });
  } catch (error) {
    next(error);
  }
};
exports.resetPassword = async (req, res, next) => {
  try {
    // 1 Get user based on the token
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpiry: { $gt: Date.now() },
    });
    // 2 if token is not expired, there is a user, set new password
    if (!user) {
      throw createAppError("Token is invalid or expired.", 400);
    }
    // 3 update the changePasswordAt property for the user
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    await user.save();
    // 4 log the user in, send jwt
    createSendToken(user, 201, res);
  } catch (error) {
    next(error);
  }
};
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, password, passwordConfirm } = req.body;
    // Get user from DB
    const user = await User.findById(req.user.id).select("+password");
    // Check current password is correct
    const isCorrectPassword = await user.correctPassword(
      currentPassword,
      user?.password
    );
    if (!isCorrectPassword) {
      throw createAppError("Your password id wrong", 401);
    }
    // update password
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    await user.save();
    // send token
    createSendToken(user, 201, res);
  } catch (error) {
    next(error);
  }
};

