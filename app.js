// const fs = require('fs');

const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();
const path = require('path');
const { default: helmet } = require('helmet');
// eslint-disable-next-line camelcase
const mongo_sanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieparser = require('cookie-parser');
const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const reviewRouter = require('./routes/reviewRouter');
const AppError = require('./utils/appError');
const ErrorController = require('./controller/errorController');
const viewRouter = require('./routes/viewRouter');
// eslint-disable-next-line camelcase

// app.use(helmet({ crossOriginEmbedderPolicy: false, originAgentCluster: true }));

// Further HELMET configuration for Security Policy (CSP)
const scriptSrcUrls = [
    'https://unpkg.com/',
    'https://tile.openstreetmap.org',
    'https://cdnjs.cloudflare.com'
];
const styleSrcUrls = [
    'https://unpkg.com/',
    'https://tile.openstreetmap.org',
    'https://fonts.googleapis.com/'
];
const connectSrcUrls = ['https://unpkg.com', 'https://tile.openstreetmap.org'];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", 'blob:'],
            objectSrc: [],
            imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
            fontSrc: ["'self'", ...fontSrcUrls]
        }
    })
);

app.use(cookieparser());

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too Many requests from this IP, Please try again in an hour'
});

app.use(express.json({ limit: '10kb' }));

app.use('/api', limiter);

app.use(mongo_sanitize());

app.use(xss());

app.use(
    hpp({
        whitelist: [
            'duration',
            'ratingsQuantity',
            'ratingsAverage',
            'maxGroupSize',
            'difficulty',
            'price'
        ]
    })
);

// app.use((req, res, next) => {
//     console.log('Hello from the middleware');
//     next();
// });

// app.use((req, res, next) => {
//     req.requestTime = new Date().toISOString();
//     console.log(req.requestTime);
//     next();
// });

app.use('/', viewRouter);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
    // res.status(404).json({
    //     status: 'fail',
    //     message: `Cannot find ${req.originalUrl} on this server`
    // });
    next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

app.use(ErrorController);

module.exports = app;
