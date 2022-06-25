const express = require('express');


const userController = require('../controllers/userController');
const authController = require('./../controllers/authController');


const userRouter = express.Router();


userRouter.param('id', (request, response, next, value) => {
    console.log('the value of id is', value);
    next();
});

userRouter.route('/sign-up').post(authController.signUp)

userRouter.route('/login').post(authController.login);

userRouter.route('/forgot-password').post(authController.forgottenPassword);

userRouter.route('/reset-password/:resetToken').patch(authController.resetPassword);

userRouter.route('/update-me').patch(authController.protectRoute, userController.updateMe);

userRouter.route('/delete-me').delete(authController.protectRoute, userController.deleteMe);

userRouter.route('/')
                .get(userController.getAllUsers)
                .post(userController.createUser);

userRouter.route('/me').get(authController.protectRoute,
                            userController.getMe,
                            userController.getUser);

userRouter.route('/:id')
                .get(userController.getUser)
                .patch(userController.updateUser)
                .delete(userController.deleteUser);


module.exports = userRouter; 
