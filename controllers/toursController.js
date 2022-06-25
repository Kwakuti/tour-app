
const Tour = require('../model/tourModel');
const factory = require('./handlerFactory');
const catchAsync = require('./../utils/catchAsync');
const GlobalError = require('./../utils/globalError');
const QueryFeatures = require('../utils/queryFeatures');

const TOUR_PATH = './data/tours.json';

exports.aliasTopTours =  (req, res, next) => {
    req.query = { sort: "-ratingAverage, price", page: 1, limit: 3, fields: "name, price, summary"}
    next();
}

exports.getAllTours = catchAsync(async (req, res, next) => {
    let myQuery = new QueryFeatures(Tour, req.query);
    myQuery.filterQueries().sort().fields().paginate();
    
    const tours = await myQuery.query;
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
                tours 
        }
    }); 
});

// statusCode, message 
/*
exports.getTour = catchAsync(async (req, res, next) => {
    const getTour = await Tour.findOne({ _id: req.params.id }).populate({ 
        path: 'reviews', 
        select: ''
    });
    if(!getTour) { 
        return next(new GlobalError(404,'Tour does not exist')); 
    }
    return res.status(200).json({
        status: 'success',
        data: {
            tour: getTour
        }
    });
});
*/


// exports.createTour = catchAsync(async (req, res, next) => {
    //     let newTour = await Tour.create(req.body);
    //     res.status(201).json({
        //         status: 'success',  
        //         data: { tour: newTour }
        //     });
        // });

exports.getAllTours = factory.getAll(Tour);

exports.getTour = factory.getOne(Tour, { path: 'reviews', select: '' });

exports.createTour = factory.createOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

exports.updateTour = factory.updateOne(Tour);

exports.checkId = (request, response, next, value) => {
    console.log(value, 'using param middleware');
    next();
}


exports.checkBody = (request, response, next) => {
    next();
}

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        { $match: { ratingsAverage: { $gte: 4.5 } } },
        { $group: { _id: null, 
            avgRating: { $avg: '$ratingsAverage'  },
            avgPrice: { $avg: '$price' },
            minimumPrice: { $min: '$price' },
            maximumPrice: { $max: '$price' },
            }
        }  
    ]);
    res.status(200).json({
        stats
    });
});


