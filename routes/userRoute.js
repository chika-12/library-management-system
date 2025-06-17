const express = require('express');
const userRoute = express.Router();
const authentication = require('../controllers/authentication');

userRoute.route('/register').post(authentication.userRegistration);

module.exports = userRoute;
