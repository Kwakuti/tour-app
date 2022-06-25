const Review = require('./../model/reviewModel');

const factory = require('./../controllers/handlerFactory');
const catchAsync = require('./../utils/catchAsync');
const GlobalError = require('./../utils/globalError');

/*
exports.getAllReview = catchAsync(async (request, response, next) => {
    let filters;
    if(request.params.tourId) {
        filters = { 'tour' : request.params.tourId };
    }
    const allReview = await Review.find(filters);    
    return response.status(200).json({
        status: 'success',
        results: allReview.length,
        data: {
            review: allReview
        }
    });
});
*/


// exports.createReview =  catchAsync(async (request, response, next) => {
//     const newReview = await Review.create({
//         review: requestBody.review,
//         rating: requestBody.rating,
//         user: loggedInUserId,
//         tour: requestBody.tour
//     });
//     return response.status(201).json({
//         status: 'success',
//         data: {
//             review: newReview
//         }
//     })
// });

exports.setTourUserIds = (request, response, next) => {
    const loggedInUserId = request.user._id;
    const requestBody = request.body;
    if(!requestBody.tour) requestBody.tour = request.params.tourId;
    next();
}

exports.getAllReview = factory.getAll(Review);

exports.createReview = factory.createOne(Review);

exports.getReview = factory.getOne(Review);

exports.updateReview = factory.updateOne(Review);

exports.deleteReview = factory.deleteOne(Review);
