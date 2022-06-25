const express = require('express');

const tourController = require('../controllers/toursController');
const authController = require('./../controllers/authController');
// const reviewController = require('./../controllers/reviewController');


const tourRouter = express.Router();
const reviewRouter = require('./reviewRouter');



tourRouter.param('id', tourController.checkId);

tourRouter.use('/:tourId/reviews', reviewRouter);

tourRouter.route('/tour-stats').get(tourController.getTourStats);

tourRouter.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours);

tourRouter.route('/')
                .get(authController.protectRoute, tourController.getAllTours)
                .post(tourController.checkBody,tourController.createTour);

tourRouter.route(`/:id`)
    .get(tourController.getTour)
    .patch(tourController.checkBody, tourController.updateTour)
    .delete(authController.protectRoute, authController.authorizeRoute('admin', 'lead-guide'), tourController.deleteTour);


module.exports = tourRouter;