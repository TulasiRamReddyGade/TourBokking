/* eslint-disable node/no-unsupported-features/es-syntax */
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const User = require('./../model/userModel');
const handlerFactory = require('./handlerFactory');

exports.getAllUsers = handlerFactory.getAll(User);
exports.createUser = (req, res, next) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined and please use /signup'
    });
};
exports.getMe = (req, res, next) => {
    req.params.id = req.user._id;
    next();
};
exports.getUser = handlerFactory.getOne(User);
exports.deleteUser = handlerFactory.deleteOne(User);
exports.updateUser = handlerFactory.updateOne(User);

const filter = (filterObj, ...allowedFields) => {
    const newObj = {};
    Object.keys(filterObj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = filterObj[el];
    });
    return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm)
        return next(new AppError('use /updatePassword', 400));
    const filterBody = filter(req.body, 'email', 'name');
    const user = await User.findByIdAndUpdate(req.user._id, filterBody, {
        new: true,
        runValidators: true
    });
    res.status(200).json({
        status: 'success',
        user
    });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user._id, { active: false });
    res.status(204).json({
        status: 'success',
        data: null
    });
});
