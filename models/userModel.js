const mongoose = require('mongoose');
const countries = require('i18n-iso-countries');
countries.registerLocale(require('i18n-iso-countries/langs/en.json'));

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function (value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      },
      message: (props) => `${props.value} is not a valid email!`,
    },
  },
  password: {
    type: String,
    required: [true, 'Set your password'],
    trim: true,
    min: 8,
    max: 20,
  },
  confirmPassword: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return this.password == value;
      },
      message: 'Passwords do not match',
    },
  },
  accountType: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  country: {
    type: String,
    required: true,
    // validate: {
    //   validator: function (value) {
    //     return countries.isValid(value);
    //   },
    //   message: (props) => `${props.value} is not a valid country!`,
    // },
  },
  countryCode: String,
  state: String,
  address: String,
  phone: Number,
});

const LibraryUser = mongoose.model('LibraryUser', userSchema);
module.exports = LibraryUser;
