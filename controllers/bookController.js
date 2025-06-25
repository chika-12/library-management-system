const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Book = require('../models/bookModel');
const Author = require('../models/authorModel');
const ApiFeature = require('../utils/apiFeatures');

exports.addBooks = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const data = await Book.create(req.body);
  if (!data) {
    return next(new AppError('book not created', 500));
  }
  res.status(200).json({
    status: 201,
    message: '✅ Book added successfully',
    data,
  });
});

exports.retriveBooks = catchAsync(async (req, res, next) => {
  const data = await new ApiFeature(Book.find(), req.query)
    .filtering()
    .sorting()
    .fields()
    .pagination().query;

  if (!data) {
    return next(new AppError('No Data', 404));
  }
  res.status(200).json({
    status: 'success',
    message: 'Retrieved all books successfully',
    result: data.length,
    data,
  });
});
exports.retriveSingleBook = catchAsync(async (req, res, next) => {
  const data = await Book.findById(req.params.id);
  if (!data) {
    return next(new AppError('Data not found', 404));
  }
  res.status(200).json({
    status: 'success',
    message: 'Retrieved a single book successfully',
    data,
  });
});

exports.updateSingleBook = catchAsync(async (req, res, next) => {
  const data = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!data) {
    return next(new AppError('Book not found', 401));
  }
  res.status(201).json({
    status: 'success',
    message: 'Post edited successfully',
    data,
  });
});

exports.deleteBook = catchAsync(async (req, res, next) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: 'success',
      message: 'Book deleted successfully',
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: 'fail',
      messgae: 'Unable to complete process',
    });
  }
});
