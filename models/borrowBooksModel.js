const mongoose = require('mongoose');

const borrowSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LibraryUser',
    required: true,
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  borrowDate: {
    type: Date,
    default: Date.now,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  returnDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['borrowed', 'returned', 'overdue'],
    default: 'borrowed',
  },
  borrowingFee: String,
  extentionFee: String,
  fine: String,
});

borrowSchema.pre(/^find/, function (next) {
  this.populate({ path: 'book' }).populate({
    path: 'user',
    select: 'name email state address',
  });
  next();
});

const BorrowBook = mongoose.model('BorrowBook', borrowSchema);
module.exports = BorrowBook;
