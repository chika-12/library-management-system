const LibraryUser = require('../models/userModel');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');

const signUpToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

exports.userRegistration = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const userData = await LibraryUser.create(req.body);

  const token = signUpToken(userData.id);
  res.status(201).json({
    message: 'User registered successfully',
    data: {
      token,
      userData,
    },
  });
});
