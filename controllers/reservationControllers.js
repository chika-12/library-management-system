const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Reservation = require('../models/reservationsModel');
const Book = require('../models/bookModel');

exports.reseveBook = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const bookId = req.body.book;

  const book = await Book.findById(bookId);
  if (!book || !book.availability) {
    return next(new AppError('This book is not available', 404));
  }

  const reserved = await Reservation.create({
    user: userId,
    book: bookId,
    expiresAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
  });

  book.availability = false;
  await book.save();
  res.status(200).json({
    status: 'success',
    message: 'Book reserved successfully',
    data: {
      reserved,
    },
  });
});
exports.cancelReservation = catchAsync(async (req, res, next) => {
  const reservation = await Reservation.findOne({ _id: req.params.id });

  if (!reservation || reservation.status !== 'active') {
    return next(
      new AppError('Reservation not active or already cancelled', 400)
    );
  }
  const book = await Book.findById(reservation.book);
  book.availability = true;
  await book.save();
  reservation.status = 'cancelled';
  await reservation.save();

  res.status(200).json({
    status: 'success',
    message: 'Resevation cancelled successfully',
    data: {
      book,
    },
  });
});
