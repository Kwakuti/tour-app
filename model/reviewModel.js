const mongoose = require('mongoose');


const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review must have text..']
    },
    rating: {
        type: Number,
        min: [1, 'Minimum value of a rating is 1'],
        max: [5, 'Maximum value of a rating is 5'],
        required: [true, 'Rating must be present']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true,'Review must belong to User']
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true,'Review must belong to Tour']
    }
}, {
    toJSON: { virtuals: true },
    toObject : { virtuals: true }
});

reviewSchema.virtual('', null);

reviewSchema.pre(/^find/, function(next) {
    // this.populate({ path: 'tour', select: ['-locations', '-startLocation', '-guides', '-summary', '-description', "-difficulty", "-ratingQuantity","-ratingsAverage","-images", "-startDates"
// ] });
    this.populate({ path: 'user', select: [ '-password', '-role', '-__v' ] });
    next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;  


