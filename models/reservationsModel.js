const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
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
  reservedAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired', 'fulfilled'],
    default: 'active',
  },
});

reservationSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name country state address',
  }).populate({
    path: 'book',
    select: 'title author',
  });
  next();
});

// reservationSchema.pre(/^find/, function (next) {
//   this.find({ status: { $ne: 'cancelled' } });
//   next();
// });
module.exports = mongoose.model('Reservation', reservationSchema);
