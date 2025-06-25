const Book = require('../models/bookModel');
const BorrowBook = require('../models/borrowBooksModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.borrowBook = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const bookId = req.body.book;

  const book = await Book.findById(bookId);
  if (!book || !book.availability) {
    return next(new AppError('Book not available', 400));
  }

  const transactionDetails = await BorrowBook.create({
    user: userId,
    book: bookId,
    borrowingFee: `₦1000`,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  book.availability = false;
  await book.save();

  res.status(200).json({
    status: 'successfull',
    message: 'Book borrowed successfully',
    data: {
      name: req.user.name,
      bookBorrowed: book.title,
      transactionDetails,
    },
  });
});

exports.returnedBook = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const bookId = req.body.book;

  const book = await Book.findById(bookId);
  if (!book || book.availability) {
    return next(
      new AppError('Sorry this book was never borrowed or not available', 400)
    );
  }

  const transactionDetails = await BorrowBook.findOne({
    user: userId,
    book: bookId,
    status: 'borrowed',
  });
  if (transactionDetails.status != 'borrowed') {
    return next(new AppError('No active borrow found for this book', 404));
  }

  transactionDetails.status = 'returned';
  transactionDetails.returnDate = new Date();
  //calculating fine

  const overdueDate =
    Math.ceil(Date.now() - transactionDetails.dueDate) / (1000 * 60 * 60 * 24);

  if (overdueDate > 0) {
    const fineAmount = overdueDate * 100;
    transactionDetails.fine = `₦${fineAmount}`;
  } else {
    transactionDetails.fine = 'Free';
  }

  await transactionDetails.save();
  book.availability = true;
  await book.save();

  res.status(200).json({
    status: 'success',
    message: 'Book returned successfully',
    data: {
      name: req.user.name,
      bookReturned: book.title,
      transactionDetails,
    },
  });
});
exports.extension = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const bookId = req.body.book;

  const transactionDetails = await BorrowBook.findOne({
    user: userId,
    book: bookId,
    status: 'borrowed',
  });
  transactionDetails.extentionFee = '₦300';
  const currentDueDate = new Date(transactionDetails.dueDate);
  const extendedDueDate = new Date(
    currentDueDate.getTime() + 3 * 24 * 60 * 60 * 1000
  );
  transactionDetails.dueDate = extendedDueDate;

  res.status(200).json({
    status: 'success',
    message: 'Book renew successfully',
    data: {
      transactionDetails,
    },
  });
});
