const express = require('express');
const app = express();
const morgan = require('morgan');
const userRoute = require('./routes/userRoute');
const AppError = require('./utils/appError');
const errorController = require('./controllers/errorController');
const bookRouter = require('./routes/bookManagement');

app.use(express.json());

app.use(morgan('dev'));

app.use('/api/auth', userRoute);
app.use('/api', bookRouter);

app.all('*', (req, res, next) => {
  return next(
    new AppError(`${req.originalUrl} is not found on this server`, 404)
  );
});

app.use(errorController);

module.exports = app;
