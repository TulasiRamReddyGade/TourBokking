/* eslint-disable node/no-unsupported-features/es-syntax */
const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const User = require('./../model/userModel');
const handlerFactory = require('./handlerFactory');

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users');
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `photo-${req.user._id}-${Date.now()}.${ext}`);
//     }
// });

const multerStorage = multer.memoryStorage();

const filter1 = (req, file, cb) => {
    if (!file.mimetype.startsWith('image')) {
        cb(new AppError('Not an image! please upload an image', 400), false);
    }
    cb(null, true);
};

// const upload = multer({ dest: 'public/img/users' });

const upload = multer({ storage: multerStorage, fileFilter: filter1 });

exports.resizeImage = (req, res, next) => {
    if (!req.file) return next();
    req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;
    sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 70 })
        .toFile(`public/img/users/${req.file.filename}`);
    next();
};

exports.uploadImage = upload.single('photo');

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
    if (req.file) filterBody.photo = req.file.filename;
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
