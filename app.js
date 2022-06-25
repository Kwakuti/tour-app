const hpp = require('hpp');
const morgan = require('morgan');
const helmet = require('helmet');
const xss = require('xss-clean');
const express = require('express');
const expressRateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

const tourRouter = require('./router/tourRouter');
const userRouter = require('./router/userRouter');
const reviewRouter = require('./router/reviewRouter');

const GlobalError = require('./utils/globalError');

const globalErrorController = require('./controllers/errorController');

const USER_PATH = '/api/v1/users';
const TOUR_PATH = '/api/v1/tours';
const REVIEW_PATH = '/api/v1/reviews';

const app = express();

app.use(helmet());

if(process.env.NODE_ENV =='development') {
    app.use(morgan('dev'));
}

const rateLimiter = expressRateLimit({
    max: 40,
    window: 30 * 60 * 1000,
    message: "Too many request from IP, try again later..."
});

app.use('/api', rateLimiter);   

app.use(express.json({ limit: '10kb' }));

app.use(mongoSanitize());

app.use(xss());

app.use(hpp({
    whitelist: ['duration','ratingsAverage', 'ratingsQuantity', 'maxGroupSize', 'price']
}))

app.use(TOUR_PATH, tourRouter);

app.use(USER_PATH, userRouter);

app.use(REVIEW_PATH, reviewRouter);

app.all('*',(req, res, next) => {
    next(new GlobalError(404, `Page ${req.originalUrl} not found.`));
})

app.use(globalErrorController);

module.exports = app;

