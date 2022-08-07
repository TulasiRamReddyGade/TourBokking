/* eslint-disable node/no-unsupported-features/es-syntax */
const catchAsync = require('./../utils/catchAsync');

const APIFeatures = require('./../utils/apiFeatures');
const AppError = require('./../utils/appError');

exports.deleteOne = Model =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id);
        // console.log(doc);
        if (!doc) return next(new AppError('no doc found with that id', 404));
        res.status(204).json({
            status: 'success'
        });
    });

exports.updateOne = Model =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!doc)
            return next(new AppError('no document found with that id', 404));
        res.status(200).json({
            status: 'success',
            data: {
                data: doc
            }
        });
    });

exports.createOne = Model =>
    catchAsync(async (req, res, next) => {
        const doc = new Model(req.body);
        await doc.save();
        res.status(201).json({
            status: 'success',
            message: 'created a new doc',
            data: {
                data: doc
            }
        });
    });

exports.getOne = (Model, populateOptions) =>
    catchAsync(async (req, res, next) => {
        let query = Model.findById(req.params.id);
        if (populateOptions) query = query.populate('reviews');
        const doc = await query;
        if (!doc)
            return next(new AppError('no documnet found with that id', 404));
        res.status(200).json({
            status: 'success',
            data: {
                data: doc
            }
        });
    });

exports.getAll = Model =>
    catchAsync(async (req, res) => {
        // const query = Tour.find(queryObj);
        // const query = Tour.find()
        //     .where('duration')
        //     .equals(5);
        // Filtering
        // const queryObj = { ...req.query };
        // const exculdeFields = ['page', 'sort', 'limit', 'fields'];
        // exculdeFields.forEach(el => delete queryObj[el]);
        // let queryStr = JSON.stringify(queryObj);
        // queryStr = queryStr.replace(/\b(gte|lte|lt|gt)\b/g, m => `$${m}`);
        // console.log(queryStr);
        // let query = Tour.find(JSON.parse(queryStr));

        // // Sorting
        // if (req.query.sort) {
        //     const sortBy = req.query.sort.split(',').join(' ');
        //     query.sort(sortBy);
        // } else {
        //     query.sort('-createdAt');
        // }
        // // Selecting

        // if (req.query.fields) {
        //     const fields = req.query.fields.split(',').join(' ');
        //     query.select(fields);
        // } else {
        //     query.select('-__v');
        // }

        // // Pagination

        // const page = req.query.page * 1 || 1;
        // const limit = req.query.limit * 1 || 1;

        // const skip = (page - 1) * limit;

        // if (req.query.page) {
        //     const docs = await Tour.countDocuments();
        //     if (skip >= docs) throw new Error('Page doesnot exist');
        // }

        // query.skip(skip).limit(limit);

        // const tours = await query;
        // To allow nested get request of tours
        let filter = {};
        if (req.params.tourId) filter = { tour: req.params.tourId };

        const query = Model.find(filter);

        const features = new APIFeatures(query, req.query);

        const doc = await features
            .filter()
            .sort()
            .limit()
            .pagination().query;

        res.status(200).json({
            status: 'success',
            result: doc.length,
            data: {
                data: doc
            }
        });
    });
