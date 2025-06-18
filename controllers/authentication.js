const LibraryUser = require('../models/userModel');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/emailServices');
const crypto = require('crypto');
const { decode } = require('punycode');
const { resolve } = require('path');

const signUpToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

const response = (data = null, statusCode, res, token = null, message) => {
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 20 * 24 * 60 * 60 * 1000,
  });

  res.status(statusCode).json({
    message: message,
    data: {
      token,
      data,
    },
  });
};

exports.userRegistration = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const user = await LibraryUser.create(req.body);

  if (!user) {
    return next(new AppError('Registration failed', 400));
  }

  const token = signUpToken(user.id);
  const message = '✅ User registered successfully';
  user.password = undefined;

  response(user, 201, res, token, message);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('wrong email or password', 400));
  }
  const user = await LibraryUser.findOne({ email: email }).select('+password');
  if (!user || !user.correctPassword(password)) {
    return next(new AppError('wrong email or password', 400));
  }
  const token = signUpToken(user.id);
  const message = '✅ Login successfully';
  user.password = undefined;
  response(user, 201, res, token, message);
});

exports.forgetPassword = catchAsync(async (req, res, next) => {
  const user = await LibraryUser.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('Email not found', 404));
  }

  const resetToken = await user.genResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const reqUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/auth/password/reset/${resetToken}`;

  const message = `Click on the url for password reset ${reqUrl}`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your reset token will expire in 10 minutes',
      message: message,
    });

    res.status(200).json({
      status: 'success',
      message: 'message sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    console.log(`Error: ${err}`);
    return next(new AppError('Error sending email', 500));
  }
});

exports.passwordReset = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  console.log(hashedToken);
  const user = await LibraryUser.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //console.log(user);

  if (!user) {
    return next(new AppError('Invalid token or token has expired', 400));
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const token = signUpToken(user.id);
  const message = 'User password reset successfully';
  user.password = undefined;
  response(user, 200, res, token, message);
});

exports.logout = catchAsync(async (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expiresIn: new Date(Date.now() + 10),
  });
  res.status(200).json({
    status: 'success',
    message: '🟢 Logged out successfully',
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('You are not logged in', 401));
  }

  const decoded = await new Promise((reolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        const message =
          err.name === 'TokenExpiredError'
            ? 'Token has expired'
            : 'Invalid Token';
        return reject(new AppError(message, 401));
      }
      resolve(decoded);
    });
  });

  const freshUser = await LibraryUser.findById(decoded.id);
  if (!freshUser) {
    return next(new AppError('This user does not exist', 401));
  }

  // if (freshUser.changePasswordAfter(decoded.iat)) {
  //   return next(
  //     new AppError('Password Change detected please log in again', 401)
  //   );
  // }
  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.roles)) {
      return next(new AppError('Unathorised action'));
    }
    next();
  };
};
