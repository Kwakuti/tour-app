const crypto = require('crypto');
const { promisify } = require('util');

const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');

const User = require('./../model/userModel');
const catchAsync = require('./../utils/catchAsync');
const GlobalError = require('./../utils/globalError');
const sendEmail = require('./../utils/email');

const SECRET_KEY = process.env.JWT_SECRET;
const TOKEN_EXPIRES = process.env.JWT_EXPIRES;
const COOKIE_TOKEN_EXPIRES = process.env.JWT_COOKIE_EXPIRES_IN;


const cookieOptions = {
    expires: new Date(Date.now() + COOKIE_TOKEN_EXPIRES * 2400 * 36000),
    httpOnly: true
}


const createAndSendToken = async (user, status, response) => {
    const token = await signWebToken(user._id, SECRET_KEY, TOKEN_EXPIRES);
    if(process.env.NODE_ENV == 'production') {
        cookieOptions.secure = true;
    }   
    response.cookie('jwt', token, cookieOptions);
    user.password = undefined;
    
    return response.status(status).json({
        status,
        token,
        data: {
            user
        }
    });
}

const signWebToken = (userId, secretKey, tokenExpires ) => {
    return  jwt.sign({ id: userId }, secretKey,{ expiresIn: tokenExpires });
}

exports.signUp = catchAsync(async (request, response, next) => {
    const requestBody = request.body;
    const newUser = await User.create({
        name: requestBody.name,
        email: requestBody.email,
        role: request.body.role,
        password:  requestBody.password,
        passwordConfirm:  requestBody.passwordConfirm,
    });
    if(!newUser) {
        next(new GlobalError(400, 'User does not exist'));
    }
    createAndSendToken(newUser, 201, response);
});

exports.login = catchAsync(async (request, response, next) => {
    const { email, password } = request.body;
    if(!email || !password) return next(new GlobalError(401, 'please input email or password'));
    const user = await User.findOne( { email : email });
    if(!user) return next(new GlobalError(401, 'Invalid email or password'));
    const correctPassword = await user.correctPassword(password, user.password);
    if(!correctPassword) {
        return next(new GlobalError(401, 'Invalid email or password'));        
    }
    createAndSendToken(user, 200, response);
}); 


exports.protectRoute = catchAsync(async (request, response, next) => {
    const authorizationToken = request.headers.authorization;
    if(!authorizationToken || !authorizationToken.startsWith('Bearer')) {
        return next(new GlobalError(403, 'Not authorized to view this route'));
    }
    const token = authorizationToken.split(' ')[1];
    if(!token) {
        return next(new GlobalError(403, 'Not logged In, please login to access'));
    } 
    const verificationResult = await jwt.verify(token, SECRET_KEY);
    const loggedInUser = await User.findById(verificationResult.id);
    if(!loggedInUser || !loggedInUser.name) {
        return next(new GlobalError(401, 'User no longer valid'));
    } 
    if(loggedInUser.changedPasswordAfter(verificationResult.iat)){
        return next(new GlobalError(401, 'Recently changes password, please login gain'));
    }
    request.user = loggedInUser;
    next();
});

exports.authorizeRoute = (...rolesWithAccess) => {
    return (request, response, next) => {
        if(request.user){
            if(rolesWithAccess.includes(request.user.role)) {
                return next();
            }
            return next(new GlobalError(401, 'You dont have access to this resource'));
        }
        return next(new GlobalError(401, 'You dont have access to this resource, Please login in'));
    }
}

exports.forgottenPassword = catchAsync(async(request, response, next) => {
    const userEmail =  request.body.email;
    if(userEmail) {
        const recoveredUser = await User.findOne({email: userEmail});
        if(!recoveredUser) {
            return next(new GlobalError(404, 'No user with email address, Invalid Email address'));
        }
        const resetToken = recoveredUser.generatePasswordResetToken();
        await recoveredUser.save({ validateBeforeSave: false });
        const resetURL = `${request.protocol}://${request.get('host')}/api/v1/users/reset-password/${resetToken}`
        try {
            await sendEmail({
                sendToEmail: userEmail,
                subject: 'Password Rest Token: valid for 5mins only',
                message: `Click on the link to reset password ${resetURL}`,    
            });    
        } catch (error) {
            recoveredUser.passwordResetToken = undefined;
            recoveredUser.passwordResetExpires = undefined;
            await recoveredUser.save({ validateBeforeSave: false });
            next(new GlobalError(500, 'Error Sending Email try again later'))
        }
        return response.status(200).json({
            status: 200,
            message: 'Token sent to email'
        });
    }
    return next(new GlobalError(404, 'Please, input valid email address'));
});


exports.resetPassword = catchAsync(async (request, response, next) => {
    const { resetToken } = request.params;
    if(!resetToken) {
        return next(new GlobalError(404, 'No reset code passed'));        
    }
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const userToModify = await User.findOne( { passwordResetToken: hashedToken });
    if(userToModify) {
        if(Date.now() < userToModify.passwordResetExpires) {
            userToModify.password = request.body.password;
            userToModify.passwordConfirm = request.body.passwordConfirm;
            userToModify.passwordResetToken = undefined;
            userToModify.passwordResetExpires = undefined;
            await userToModify.save();
            // const token = await signWebToken(userToModify._id, SECRET_KEY, TOKEN_EXPIRES);
            // return response.status(200).json({
            //     status: 'success',
            //     token
            // });
            createAndSendToken(userToModify, 200 ,response);
        }
        return next(new GlobalError(400, 'Invalid or Expired Token.'));               
    }
    return next(new GlobalError(400, 'Invalid or Expired Token..'));         
});


exports.updatePassword = catchAsync(async (request, response, next) => {
    const loggedInUser = request.user;
    // const loggedInUser = await User.findById(request.user._id).select('+password');
    if(!loggedInUser) {
        return next(new GlobalError(400, 'Please login to change password'));
    }
    const { password, newPassword, newpasswordConfirm } = request.body;
    const correctPassword = await loggedInUser.correctPassword(password, loggedInUser.password);
    if(!correctPassword) {
        return next(new GlobalError(401, 'Invalid password'));
    }
    loggedInUser.password = newPassword;
    loggedInUser.passwordConfirm = newpasswordConfirm;
    await loggedInUser.save();
    createAndSendToken(loggedInUser, 200, response); 
});