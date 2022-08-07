/* eslint-disable no-lonely-if */
const AppError = require('../utils/appError');

const sendErrorDev = (err, req, res) => {
    // console.log(1);
    if (req.originalUrl.startsWith('/api')) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            stack: err.stack,
            error: err
        });
    } else {
        res.status(err.statusCode).render('error', {
            tourContext: 'Something went wrong',
            msg: err.message
        });
    }
};

const sendErrorPro = (err, req, res) => {
    if (err.isOperational) {
        if (req.originalUrl.startsWith('/api')) {
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        } else {
            res.status(err.statusCode).render('error', {
                tourContext: 'Something went wrong',
                msg: err.message
            });
        }
    } else {
        // console.error(err); q
        if (req.originalUrl.startsWith('/api')) {
            res.status(500).json({
                status: 'error',
                message: 'Something really went wrong. Please try again'
            });
        } else {
            res.status(500).render('error', {
                tourContext: 'error',
                msg: 'Something really went wrong. Please try again'
            });
        }
    }
};

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
};
const handleDuplicateError = err => {
    const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/);
    // console.log(value);
    const message = `Duplicate key value ${value}. Please enter another value`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
    const error = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input Data. ${error.join('. ')}`;
    return new AppError(message, 400);
};

const handleJWTInvalidSignature = err => {
    return new AppError('Invalid token. Please login again', 401);
};

const handleTokenExpiredError = () =>
    new AppError('Your token has expired. Please login again', 401);

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV === 'production') {
        let error = Object.assign(err);
        console.log(error.name);
        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code == 11000) error = handleDuplicateError(error);
        if (error.name === 'ValidationError')
            error = handleValidationErrorDB(error);
        if (error.name === 'JsonWebTokenError')
            error = handleJWTInvalidSignature(error);
        if (err.name === 'TokenExpiredError') error = handleTokenExpiredError();
        sendErrorPro(error, req, res);
    }
    if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line node/no-unsupported-features/es-syntax, no-unused-vars
        // console.log(err);

        sendErrorDev(err, req, res);
    }
};
