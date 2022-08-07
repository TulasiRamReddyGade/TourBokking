/* eslint-disable node/no-unsupported-features/es-syntax */
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const catchAsync = require('../utils/catchAsync');
const User = require('./../model/userModel');
const email = require('./../utils/email');
const AppError = require('../utils/appError');

const cookieOptions = {
    expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
};

if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
}
const createSendToken = (user, statusCode, res) => {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
    res.cookie('jwt', token, cookieOptions);
    if (statusCode === 201) {
        user.password = undefined;
        return res.status(201).json({
            status: 'success',
            token,
            data: { user }
        });
    }
    res.status(statusCode).json({
        status: 'success',
        token
    });
};

const jwtVerifyAsync = token => {
    // eslint-disable-next-line no-new
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
            if (err) reject(err);

            resolve(data);
        });
    });
};

exports.signUp = catchAsync(async (req, res) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        photo: req.body.photo,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });
    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    // eslint-disable-next-line no-shadow
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new AppError('Please provide email and password'), 400);
    }
    const user = await User.findOne({ email: email }).select('+password');
    if (!user) {
        return next(new AppError('Please enter valid email or password'), 401);
    }
    const correct = await user.correctPassword(user.password, password);
    // console.log(correct);
    if (!correct)
        return next(new AppError('Please enter valid email or password'), 401);

    createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer ')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    if (!token)
        return next(new AppError('You are not logged in. Please Login', 401));
    // console.log(token);

    const decode = await jwtVerifyAsync(token);

    const freshUser = await User.findById(decode.id);

    if (!freshUser)
        return next(
            new AppError(
                'The user belonging to this token no longer exist',
                401
            )
        );
    if (await freshUser.changePasswordAfter(decode.id))
        return next(
            new AppError(
                'User recently changed password. please login again',
                401
            )
        );
    // console.log(freshUser);
    req.user = freshUser;
    next();
});
exports.isLoggedIn = async (req, res, next) => {
    try {
        if (req.cookies.jwt) {
            const token = req.cookies.jwt;
            const decode = await jwtVerifyAsync(token);
            const user = await User.findById(decode.id);
            if (!user) return next();
            if (await user.changePasswordAfter(decode.id)) return next();
            res.locals.user = user;
            return next();
        }
    } catch (err) {
        return next();
    }
    next();
};

exports.logout = (req, res, next) => {
    res.cookie('jwt', 'logged out', {
        httpOnly: true,
        expires: new Date(Date.now() + 10 * 1000)
    });
    res.status(200).json({
        status: 'success'
    });
};
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // console.log(1);
        // console.log(req.user.role);
        if (!roles.includes(req.user.role))
            return next(
                new AppError('You are not allowed to view this route', 403)
            );
        next();
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user)
        return next(new AppError('No user found with this email Id', 400));

    const resetToken = user.createPasswordResetToken();

    await user.save({ validateBeforeSave: false });
    const resetUrl = `${req.protocol}://${req.get(
        'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    // console.log(resetUrl);

    const message = `Forgot your password? send a patch request to ${resetUrl} with password and password confirm.\n If you didn't forgot your password please ignore this email`;
    try {
        await email({
            email: 'user@gmail.com',
            subject: 'Your password reset token valid for 10min',
            message
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(
            new AppError(
                'There was an email sending the email.Please try again',
                500
            )
        );
    }

    res.status(200).json({
        status: 'success',
        message: 'Token sent to email'
    });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    const token = req.params.token;

    const hashedToken = await crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
    console.log(hashedToken);
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });
    if (!user) return next(new AppError('Token is invalid or expired', 400));
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user._id).select('+password');
    console.log(req.body);
    if (!(await user.correctPassword(user.password, req.body.passwordCurrent)))
        return next(new AppError('Invalid Password', 400));

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    await user.save();

    createSendToken(user, 200, res);
});
