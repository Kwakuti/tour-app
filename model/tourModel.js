const slugify = require('slugify');
const mongoose = require('mongoose');
const validator = require('validator');

const User = require('./userModel');
const GlobalError = require('./../utils/globalError');


const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tour must have a name'],
        trim: true,
        unique: true,
        maxLength: [40, 'Tour name must not be more than 40 characters'],
        // validate: [ validator.isAlpha, 'Does not accept number only alphabets']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'Tour must have duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, "tour must have a group size"]
    },
    difficulty: {
        type: String,
        default: 'easy',
        required: [true, 'Tour must have difficulty'],
        enum: { values: ['easy', 'medium', 'difficult'], message: 'Value must be of known type' }
    },
    price: {
        type: Number,
        required: [true, 'Tour must have price']
    },
    ratingQuantity: {
        type: Number,
        default: 0
    },
    ratingsAverage: {
        type: Number,
        default: 1,
        min: [1, 'Tour can not have rating less than 1'],
        max: [5, 'Tour can not have rating greater than 5']
    },
    discount: {
        type: Number,
        validate: {
            message: 'Discount can not be larger than Price',
            validator: function(discountPrice) {
                return this.price >= discountPrice;
            }
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'Tour must have summary']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        // required: [true, 'Tour must have cover image']
    }, 
    images: {
        type: [String],
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    guides: [
        { 
            type: [mongoose.Types.ObjectId],
            ref: 'User'
        }
    ],
    startDates: {
        type: [Date],
    },
    deletedAt: {
        type: Date,
    },
    secretTour: {
        type: Boolean,
        default: false,
        select: false
    },
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: {
             type: [Number]
        },
        addres: String,
        description: String 
    },
    locations: [ {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number  
    } ]
}, { toJSON: { virtuals: true}, toObject: { virtuals: true} });

tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
});


tourSchema.virtual('durationWeeks').get(function() { return this.duration/7});
 
tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});


/*
tourSchema.pre('save', async function(next){
     try{
        const guidesPromises = this.guides.map( async userId => {
            return await User.findById(userId);
        });
        console.log(guidesPromises instanceof Array)
        this.guides = await Promise.all(guidesPromises);
        next();
    }catch(error){
        next(new GlobalError(400, 'User doesnt exist...'));
    }
});
*/

tourSchema.post('save', function(document, next){
    next();
});

tourSchema.pre(/^find/, function(next){
    this.find({ secretTour: { $eq: false } });
    this.initialTime = Date.now();
    this.populate({ 
        path: 'guides',
        select: '-__v, -password'
    });
    next();
});

tourSchema.pre(/^find/, function(next){
    this.populate({ 
        path: 'guides',
        select: '-__v, -password'
    });
    next();
});


tourSchema.post(/^find/, function(documents, next) {
    console.log(`Execution Time', ${Date.now() - this.initialTime}`);
    next();
});

tourSchema.pre('aggregate', function(next){
    this.pipeline().unshift({ $match: { secretTour: { $eq: false } } });
    console.log(this.pipeline());
    next();
});

tourSchema.post('aggregate', function(aggregatePipline,next){
    next();
});

module.exports = mongoose.model('Tour', tourSchema);
