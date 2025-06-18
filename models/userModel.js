const mongoose = require('mongoose');
const countries = require('i18n-iso-countries');
countries.registerLocale(require('i18n-iso-countries/langs/en.json'));
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
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
      select: false,
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
    name: {
      type: String,
      required: [true, 'Name is required'],
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

    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.methods.correctPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.genResetPasswordToken = async function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log(
    `ResetToken ${resetToken}  hashedToken ${this.passwordResetToken}`
  );
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const LibraryUser = mongoose.model('LibraryUser', userSchema);
module.exports = LibraryUser;
