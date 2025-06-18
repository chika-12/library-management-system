const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId, // or String if you're using UUIDs
      ref: 'Author',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: String,
    nationality: String,
  },
  genre: {
    type: String,
    enum: [
      'Fiction',
      'Non-Fiction',
      'Mystery',
      'Science',
      'Biography',
      'Romance',
      'Other',
    ],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  availability: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isbn: String,
  publisher: String,
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
