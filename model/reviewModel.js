/* eslint-disable node/no-unsupported-features/es-syntax */
const mongoose = require('mongoose');

const tourModel = require('./../model/tourModel');

const userModel = require('./../model/userModel');

const schema = mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'Review cannot be empty!']
        },
        rating: {
            type: Number,
            max: 5,
            min: 1
        },
        createdAt: {
            type: Date,
            default: Date.now()
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tours',
            required: [true, 'Review must belong to a tour']
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'users',
            required: [true, 'Review must belong to a user']
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtulas: true }
    }
);

schema.statics.calcAverageRating = async function(tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                nAverage: { $avg: '$rating' }
            }
        }
    ]);
    await tourModel.findByIdAndUpdate(tourId, {
        ratingsAverage: stats[0].nAverage,
        ratingsQuantity: stats[0].nRating
    });
    console.log(stats);
};

schema.index({ tour: 1, user: 1 }, { unique: true });

schema.post('save', function() {
    // console.log(this.constructor.calcAverageRating);
    this.constructor.calcAverageRating(this.tour);
});

schema.pre(/^find/, function(next) {
    // this.populate({ path: 'user', select: 'name photo' }).populate({
    //     path: 'tour',
    //     select: 'name'
    // });
    this.populate({ path: 'user', select: 'name photo' });
    next();
});

schema.pre(/findOneAnd/, async function(next) {
    // console.log(this);
    this.r = await this.findOne();
    next();
});
schema.post(/findOneAnd/, async function(doc, next) {
    this.r.constructor.calcAverageRating(doc.tour);
    next();
});
const model = mongoose.model('reviews', schema);

module.exports = model;
