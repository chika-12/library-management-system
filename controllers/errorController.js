const AppError = require('../utils/appError');

const mongoServerError = (error) => {
  const field = Object.keys(error.keyValue)[0];
  const value = error.keyValue[field];
  const message = `❌ Duplicate field value: '${value}' already exists for '${field}'. Please use a different value.`;
  return new AppError(message, 400);
};

const validationError = (error) => {
  return new AppError(error.message, 500);
};

const production = (error, res) => {
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'something went wrong',
    });
  }
};

const development = (error, res) => {
  res.status(error.statusCode).json({
    status: error.status,
    error,
    message: error.message,
    stack: error.stack,
  });
  console.log(`❌🔥💥 Error: ${error}`);
};

const errorController = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  console.log(`❌🔥💥 Error: ${err}`);

  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  if (process.env.NODE_ENV === 'production') {
    if (err.code === 11000) {
      error = mongoServerError(error);
    }
    if (err.name === 'ValidationError') {
      error = validationError(error);
    }
    production(error, res);
  }
  if (process.env.NODE_ENV === 'development') {
    development(error, res);
  }
};
module.exports = errorController;
