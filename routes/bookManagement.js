const express = require('express');
const bookRouter = express.Router();
const bookController = require('../controllers/bookController');
const authentication = require('../controllers/authentication');
const borrowBooksController = require('../controllers/borrorwController');
const reservationController = require('../controllers/reservationControllers');
const historyControllers = require('../controllers/historyControllers');

bookRouter.use(authentication.protect);
//book management routes
bookRouter
  .route('/books')
  .post(authentication.restrictTo('admin'), bookController.addBooks)
  .get(bookController.retriveBooks);
bookRouter
  .route('/books/:id')
  .get(bookController.retriveSingleBook)
  .patch(authentication.restrictTo('admin'), bookController.updateSingleBook)
  .delete(authentication.restrictTo('admin'), bookController.deleteBook);

//Borrow book routes
bookRouter.route('/borrow').post(borrowBooksController.borrowBook);
bookRouter.route('/return').post(borrowBooksController.returnedBook);
bookRouter.route('/renew').post(borrowBooksController.extension);

//Book resevation routes
bookRouter.route('/reserve').post(reservationController.reseveBook);
bookRouter
  .route('/reserve/:id')
  .delete(reservationController.cancelReservation);

//User borrowed history
bookRouter.route('/history').get(historyControllers.borrowedHistory);
bookRouter.route('/fines').get(historyControllers.userFine);
module.exports = bookRouter;
