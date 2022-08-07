/* eslint-disable node/no-unsupported-features/es-syntax */
const Tour = require('./../model/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
exports.getOverview = catchAsync(async (req, res, next) => {
    const tours = await Tour.find();
    // console.log(tours);
    res.status(200).render('overview', {
        tourContext: 'Exciting tours for adventurous people',
        tours
    });
});

exports.getBase = (req, res, next) => {
    res.status(200).render('base');
};

exports.getTourDetails = catchAsync(async (req, res, next) => {
    const tour = await Tour.find({ slug: req.params.tourName }).populate({
        path: 'reviews',
        fields: 'review rating user'
    });
    // console.log(tour);
    // if (tour.length === 0)
    //     return next(new AppError('There is no tour with given name', 404));
    const leadGuides = tour[0].guides.filter(el => el.role === 'lead-guide');
    const guides = tour[0].guides.filter(el => el.role === 'guide');
    // console.log(tour);
    const tourContext = `${tour[0].name} tour`;
    res.status(200).render('tourOverview', {
        tourContext,
        tour: tour[0],
        leadGuides,
        guides,
        reviews: tour[0].reviews
    });
});

exports.login = catchAsync(async (req, res, next) => {
    res.status(200).render('login', {
        tourContext: 'Login to your account'
    });
});

exports.me = catchAsync(async (req, res, next) => {
    res.status(200).render('me', { tourContext: 'Your Account Settings' });
});
