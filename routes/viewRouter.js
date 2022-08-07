const express = require('express');

const Router = express.Router();

const viewController = require('./../controller/viewController');

const authController = require('./../controller/authController');

// Router.get('/', viewController.getBase);

Router.use(authController.isLoggedIn);

Router.get('/', viewController.getOverview);

Router.get('/tours/:tourName', viewController.getTourDetails);

Router.get('/login', viewController.login);

Router.get('/me', authController.protect, viewController.me);
module.exports = Router;
