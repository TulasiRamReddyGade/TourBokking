/* eslint-disable node/no-unsupported-features/es-syntax */

const tourRouter = require('../routes/tourRouter');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Tour = require('./../model/tourModel');
const APIFeatures = require('./../utils/apiFeatures');

const handlerFactory = require('./handlerFactory');

exports.alias = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};

exports.checkBody = function(req, res, next) {
    if (!req.body.name || !req.body.price)
        return res.status(400).json({
            status: 'fail',
            message: 'Misssing name or price'
        });
    next();
};

exports.checkID = (req, res, next, val) => {
    // console.log(`id : ${val}`);
    if (req.params.id * 1 >= tours.length) {
        return res.status(400).json({
            status: 'fail',
            message: 'Invalid Id'
        });
    }
    next();
};

exports.getWithin = catchAsync(async (req, res, next) => {
    const { latlng, unit, distance } = req.params;
    const [lat, lng] = latlng.split(',');
    if (!lat || !lng)
        return new AppError(
            'Please provide lat and lng in the format lat,lng',
            400
        );
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    // console.log(lng, lat);

    const tours = await Tour.find({
        startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    });

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            data: tours
        }
    });
});

exports.getDistance = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    if (!lat || !lng)
        return new AppError(
            'Please provide lat and lng in the format lat,lng',
            400
        );

    const multipler = unit === 'mi' ? 0.000621371 : 0.001;

    const distance = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: multipler
            }
        },
        {
            $project: {
                name: 1,
                distance: 1
            }
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            data: distance
        }
    });
});

exports.getAllTours = handlerFactory.getAll(Tour);
exports.getTour = handlerFactory.getOne(Tour, { path: 'reviews' });
exports.createTour = handlerFactory.createOne(Tour);
exports.updateTour = handlerFactory.updateOne(Tour);
exports.deleteTour = handlerFactory.deleteOne(Tour);

exports.tourStats = catchAsync(async (req, res) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
                sum: { $sum: 1 }
            }
        }
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    });
});
exports.getMonthlyPlan = catchAsync(async (req, res) => {
    const { year } = req.params;
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                totalTours: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: {
                month: '$_id'
            }
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $sort: {
                totalTours: -1
            }
        },
        {
            $limit: 6
        }
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            plan
        }
    });
});
