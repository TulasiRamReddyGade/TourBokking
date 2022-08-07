/* eslint-disable node/no-unsupported-features/es-syntax */
const express = require('express');

const app = express();

const fs = require('fs');

const mongoose = require('mongoose');
const Tour = require('./../../model/tourModel');
const User = require('./../../model/userModel');
const Review = require('./../../model/reviewModel');
const dotenv = require('dotenv');

dotenv.config({ path: './../../config.env' });

if (process.env.NODE_ENV === 'production') {
    const URL = process.env.DATABASE.replace(
        '<PASSWORD>',
        process.env.DATABASE_PASSWORD
    );
    mongoose
        .connect(URL, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        })
        .then(con => console.log('databse connected '))
        .catch(err => {
            console.log('error in connecting db');
        });
} else {
    const URL = 'mongodb://localhost:27017/natours';
    mongoose
        .connect(URL, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        })
        .then(con => {
            console.log('connected to db');
        })
        .catch(err => {
            console.log(`error in connecting db ${err}`);
        });
}

const tours = JSON.parse(
    fs.readFileSync(`./dev-data/data/tours.json`, 'utf-8')
);
const users = JSON.parse(
    fs.readFileSync(`./dev-data/data/users.json`, 'utf-8')
);
const reviews = JSON.parse(
    fs.readFileSync(`./dev-data/data/reviews.json`, 'utf-8')
);

const importData = async () => {
    try {
        await Tour.create(tours);
        await User.create(users, { validateBeforeSave: false });
        await Review.create(reviews);
        console.log('data loaded');
        process.exit();
    } catch (err) {
        console.log(err);
    }
};

const deleteData = async () => {
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log('data deleted');
        process.exit();
    } catch (error) {
        console.log(error);
    }
};

// console.log(process.argv[2]);

if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
}
