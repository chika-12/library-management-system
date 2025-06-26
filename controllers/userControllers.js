const catchAsync = require('../utils/catchAsync');
const LibraryUser = require('../models/userModel');
const AppError = require('../utils/appError');

exports.userProfile = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const user = await LibraryUser.findById(userId);
  if (!user) {
    return next(new AppError('This user does not exist', 404));
  }
  res.status(200).json({
    status: 'success',
    message: 'user details retrived successfully',
    data: {
      user,
    },
  });
});

exports.retriveAllUsers = catchAsync(async (req, res, next) => {
  const allUsers = await LibraryUser.find();
  if (!allUsers) {
    return next(AppError('No User', 404));
  }
  res.status(200).json({
    status: 'success',
    message: 'Users retrived successfully',
    data: {
      number_of_users: allUsers.length,
      allUsers,
    },
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  if (!req.params.id) {
    req.params.id = req.user.id;
  }
  const userId = req.params.id;
  const user = await LibraryUser.findByIdAndUpdate(userId, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'user updated successfully',
    data: {
      user,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  await LibraryUser.findByIdAndDelete(userId);
  if (await LibraryUser.findById(userId)) {
    return next(new AppError('Unable to delete user', 400));
  }
  res.status(403).json({
    status: 'success',
    message: 'user deleted successfully',
    data: null,
  });
});
