const express = require('express');

const reviewController = require('./../controller/reviewController');
const authController = require('./../controller/authController');

const Router = express.Router({ mergeParams: true });

Router.use(authController.protect);

Router.route('/')
    .get(reviewController.getReviews)
    .post(
        authController.restrictTo('user'),
        reviewController.setIds,
        reviewController.createReview
    );

Router.route('/:id')
    .delete(
        authController.protect,
        authController.restrictTo('user', 'admin'),
        reviewController.deleteReview
    )
    .patch(
        authController.protect,
        authController.restrictTo('user', 'admin'),
        reviewController.updateReview
    )
    .get(reviewController.getReview);

module.exports = Router;
