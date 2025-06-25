const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Reservation = require('../models/reservationsModel');
const Book = require('../models/bookModel');
const ApiFeature = require('../utils/apiFeatures');
const BorrowBook = require('../models/borrowBooksModel');

exports.borrowedHistory = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const features = await new ApiFeature(
    BorrowBook.find({ user: userId }),
    req.query
  )
    .filtering()
    .fields()
    .sorting()
    .pagination();
  const history = await features.query;
  if (!history) {
    return next(new AppError('You have no borrowed history yet', 404));
  }
  res.status(200).json({
    status: 'success',
    message: 'Retrieved all borrowed books history successfully',
    data: {
      result: history.length,
      history,
    },
  });
});
exports.userFine = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const features = new ApiFeature(
    BorrowBook.find({ user: userId }).select('fine'),
    req.query
  )
    .filtering()
    .sorting()
    .fields()
    .pagination();
  const fine = await features.query;
  if (!fine) {
    return next(new AppError('No fine yet', 404));
  }
  const filtered = fine.map((entry) => ({
    amount: entry.fine,
    bookId: entry.book?._id,
    bookTitle: entry.book?.title,
    user: entry.user.name,
    transactionDate: entry.borrowDate,
  }));

  res.status(200).json({
    status: 'success',
    message: 'Retrieved all fines successfully',
    data: {
      result: fine.length,
      filtered,
    },
  });
});
