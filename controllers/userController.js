const fileSystem = require('fs');

const User = require('./../model/userModel');
const reviewController = require('./reviewController');
const catchAsync = require('./../utils/catchAsync');
const GlobalError = require('./../utils/globalError');
const factory = require('./../controllers/handlerFactory');


const USER_PATH = './data/tours.json';


// const userData = JSON.parse(fileSystem.readFileSync(USER_PATH,'utf-8'));

/*

exports.getAllUsers =  catchAsync(async (req, res) => {   
    console.log('Protect Route 3')     
    const users = await User.find();
    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
                users 
        }
    }); 
});
*/

exports.getMe = (request, response, next) => {
    request.params.id = request.user._id;
    next();
}

exports.getAllUsers = factory.getAll(User);  

exports.getUser = factory.getOne(User);

/*
exports.getUser = (req, res) => {
    const userId = req.params.id * 1;
    const user = userData[userData.length - 1];
    if(!user){
        return res.status(404).json({
            status: 'fail',
            message: 'user does not exist'
        });
    }
    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
}

*/

exports.createUser = (req, res) => {
    const userId = req.params.id * 1;
    const user = userData[userData.length - 1];
    res.status(500).json({    
        status: 'failed',
        data: 'Please use Sign Up'
    });
}

exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);

// exports.deleteUser = async (req, res) => {
//     await User.deleteMany();
//     res.status(204).json({
//         status: 'success',
//         message: 'deleted successfully'
//     });
// }


exports.updateMe = catchAsync(async (request, response, next) => {
    const loggedInUser = request.user;
    const { body } = request;
    if(!loggedInUser) {
        return new GlobalError(400, "Please login or sign up");
    }
    if(body.password || body.passwordConfirm) {
        console.log(3)
        return next(new GlobalError(400, "Cant update password from here, please use Route: /change-my password"));
    }
    const updatedUser =  await User.findByIdAndUpdate(loggedInUser._id, {
        name: body.name || loggedInUser.name,
        email: body.email || loggedInUser.email
    }, { new: true, runValidators: true });
    return response.status(200).json({
        status: 'success',
        user: updatedUser
    });
});

exports.deleteMe = catchAsync(async (request, response, next) => {
    const userToDelete = request.user;
    const deletedUser = await User.findByIdAndUpdate(userToDelete._id, { active: false, deletedAt: Date.now() });
    response.status(204).json({
        status: 'success',
        data: null
    });
});
