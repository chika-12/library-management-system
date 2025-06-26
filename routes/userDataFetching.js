const express = require('express');
const usersData = express.Router();
const userControllers = require('../controllers/userControllers');
const authentication = require('../controllers/authentication');

usersData.use(authentication.protect);

usersData.get('/profile', userControllers.userProfile);
usersData.get(
  '/allusers',
  authentication.restrictTo('admin'),
  userControllers.retriveAllUsers
);
usersData.patch(
  '/update/:id',
  authentication.restrictTo('admin'),
  userControllers.updateUser
);
usersData.delete(
  '/delete/:id',
  authentication.restrictTo('admin'),
  userControllers.deleteUser
);

module.exports = usersData;
