const express = require('express');
const multer = require('multer');

const userRouter = express.Router();

const userController = require('./../controller/userController');
const authController = require('./../controller/authController');
const AppError = require('../utils/appError');

userRouter.post('/signup', authController.signUp);
userRouter.post('/login', authController.login);
userRouter.get('/logout', authController.logout);
userRouter.post('/forgotPassword', authController.forgotPassword);
userRouter.patch('/resetPassword/:token', authController.resetPassword);

// protect all routes after this middleware
userRouter.use(authController.protect);
userRouter.patch('/updateMyPassword', authController.updatePassword);

userRouter.patch(
    '/updateMe',
    authController.protect,
    userController.uploadImage,
    userController.resizeImage,
    userController.updateMe
);
userRouter.delete('/deleteMe', authController.protect, userController.deleteMe);

userRouter.get('/me', userController.getMe, userController.getUser);

userRouter.use(authController.restrictTo('admin'));

userRouter
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

userRouter
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = userRouter;
