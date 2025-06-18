const express = require('express');
const userRoute = express.Router();
const authentication = require('../controllers/authentication');

userRoute.route('/register').post(authentication.userRegistration);
userRoute.route('/login').post(authentication.login);
userRoute.route('/password/forget').post(authentication.forgetPassword);
userRoute.route('/password/reset/:token').post(authentication.passwordReset);
userRoute.route('/logout').post(authentication.logout);
userRoute.route('/protect').get(authentication.protect);

module.exports = userRoute;
