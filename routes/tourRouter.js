const express = require('express');

const tourController = require('./../controller/tourController');

const authController = require('./../controller/authController');

// const reviewController = require('./../controller/reviewController');

const reviewRouter = require('./reviewRouter');

const tourRouter = express.Router();
// tourRouter.param('id', tourController.checkID);

// /tour/:touid/reviews
// /tour/:tourid/review/:reviewid

tourRouter.use('/:tourId/reviews', reviewRouter);

tourRouter.route('/tourStats').get(tourController.tourStats);
tourRouter
    .route('/getMonthlyPlan/:year')
    .get(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide', 'guide'),
        tourController.getMonthlyPlan
    );

tourRouter
    .route('/Top5BeastCheap')
    .get(tourController.alias, tourController.getAllTours);

tourRouter
    .route('/tourWithin/:distance/center/:latlng/unit/:unit')
    .get(tourController.getWithin);

tourRouter
    .route('/distances/:latlng/unit/:unit')
    .get(tourController.getDistance);

tourRouter
    .route('/')
    .get(tourController.getAllTours)
    .post(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.createTour
    );

tourRouter
    .route('/:id')
    .get(authController.protect, tourController.getTour)
    .patch(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.updateTour
    )
    .delete(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.deleteTour
    );

module.exports = tourRouter;
