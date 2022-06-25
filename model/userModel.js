const crypto = require('crypto');

const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs'); 
const GlobalError = require('./../utils/globalError');

const VERIFY_EMAIL = /^([A-Za-z]|[0-9])+$/;

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        minimum: [4, 'Users name must be more than 4 characters'],
        required: [true, 'User must have a name']
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        required: [true, 'User must have an email'],
        validate: [validator.isEmail, 'User must have valid email']
    },
    role: { 
        type: String,     
        enum: ['admin', 'lead-guide', 'guide', 'user'],    
        default: 'user' 
    },
    password: {
        type: String,
        minlength: [3, 'Password must exceed 3 characters'],
        required: [true, 'User must has a password'],
        select: true
    },
    passwordConfirm: { 
        type: String,
        select: false,
        required: true,
        validate: { 
            validator: function(passwordConfirmValue) {
                // return true
                return this.password === passwordConfirmValue
            }, message: 'password and confirm password must be the same'
    }},  
    photo: {
        type: String,
        required: [false, 'User must has confirm photo']
    },
    passwordChangedAt: {
        type: Date,
        select: false
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    deletedAt: { 
        type: Date,
        select: false
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
});

userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) {
        return next();
    }
    this.password = await bcryptjs.hash(this.password, 6)
    this.passwordConfirm = undefined;
    return next();
});


userSchema.pre('save', async function(next) {
    if(!this.isModified('password') || this.isNew ) {
        return next();
    }
    this.passwordChangedAt = Date.now() - 1000;
    return next();
});

userSchema.pre(/^find/, function(next) {
    this.find({ active: { $eq: true} });
    next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    console.log(candidatePassword);
    console.log(userPassword);
    return await bcryptjs.compare(candidatePassword, userPassword);
}

userSchema.methods.changedPasswordAfter =  function(jwtTimeOfIssue) {
    if(this.passwordChangedAt) {
        return parseInt(this.passwordChangedAt.getTime()/1000, 10) > jwtTimeOfIssue;
    }
    return false;
}
 userSchema.methods.generatePasswordResetToken = function(){
    const resetToken = crypto.randomBytes(5).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + (15 * 60 * 1000);
    return resetToken;
}
/*
userSchema.pre('save', function(next) {
    if(this.password === this.passwordConfirm) {
        next();
    }
    next(new GlobalError(401, 'Password and Confirm password do not match'))
});

validate: [ validator.isEmail, 'Please use a valid email' ]
*/

module.exports = mongoose.model('User', userSchema);
