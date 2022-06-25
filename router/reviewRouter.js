const express = require('express');

const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');

const reviewRouter = express.Router({ mergeParams: true });


reviewRouter.route('/')
                    .get(reviewController.getAllReview)
                    .post(authController.protectRoute,
                            authController.authorizeRoute('user'),
                            reviewController.setTourUserIds,
                            reviewController.createReview);

reviewRouter.route('/:id')
                .get(reviewController.getReview)
                .delete(reviewController.deleteReview)
                .patch(reviewController.updateReview);

module.exports = reviewRouter;