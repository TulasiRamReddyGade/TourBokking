/* eslint-disable node/no-unsupported-features/es-syntax */
const reviewModel = require('./../model/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const handlerFactory = require('./handlerFactory');

exports.setIds = (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user._id;
    next();
};

exports.createReview = handlerFactory.createOne(reviewModel);
exports.getReviews = handlerFactory.getAll(reviewModel);

exports.deleteReview = handlerFactory.deleteOne(reviewModel);
exports.updateReview = handlerFactory.updateOne(reviewModel);
exports.getReview = handlerFactory.getOne(reviewModel);
