const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: String,
    nationality: String,
    biography: {
      type: String,
      default: 'No biography available.',
    },
    books: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
      },
    ],
  },
  { timestamps: true }
);

const Author = mongoose.model('Author', authorSchema);

module.exports = Author;
