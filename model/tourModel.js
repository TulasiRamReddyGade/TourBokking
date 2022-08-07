/* eslint-disable node/no-unsupported-features/es-syntax */
const mongoose = require('mongoose');
const userModel = require('./userModel');

const schema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Every tour should have a name'],
            unique: true,
            maxlength: [
                40,
                'A tour should have a name of less than 40 characters'
            ]
        },
        slug: String,
        duration: {
            type: Number,
            required: [true, 'Every tour should have a duration']
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'Every tour should have group size']
        },
        difficulty: {
            type: String,
            required: [true, 'Every tour should have difficulty'],
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message: 'Error message'
            }
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            set: value => Math.round(value * 10) / 10
        },
        ratingsQuantity: {
            type: Number,
            default: 0
        },
        price: {
            type: Number,
            required: [true, 'Every tour should have a price']
        },
        priceDiscount: {
            type: Number,
            validate: {
                validator: function(val) {
                    return val > this.price;
                },
                message: `error message ({VALUE})`
            }
        },
        summary: {
            type: String,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        imageCover: {
            type: String,
            required: [true, 'A Tour must have a required image']
        },
        images: [String],
        createdAt: {
            type: Date,
            default: Date.now()
        },
        startDates: [Date],
        screteTour: {
            type: Boolean,
            default: false
        },
        startLocation: {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String
        },
        locations: [
            {
                type: {
                    type: String,
                    default: 'Point',
                    enum: ['Point']
                },
                coordinates: [Number],
                address: String,
                description: String,
                day: Number
            }
        ],
        guides: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'users'
            }
        ]
    },
    {
        toJSON: {
            virtuals: true
        },
        toObject: {
            virtuals: true
        }
    }
);

schema.index({ price: 1, ratingsAverage: -1 });

schema.index({ slug: 1 });

schema.index({ startLocation: '2dsphere' });

schema.virtual('durationWeeks').get(function() {
    return this.duration / 7;
});

schema.virtual('reviews', {
    ref: 'reviews',
    foreignField: 'tour',
    localField: '_id'
});

schema.pre('save', function(next) {
    // console.log(this);
    this.slug = this.name.toLowerCase();
    next();
});

schema.post('save', function(doc, next) {
    console.log('Hello from post save middleware');
    next();
});

schema.pre(/^find/, function(next) {
    this.find({ screteTour: { $ne: true } });
    this.start = Date.now();
    next();
});

// schema.pre('save', async function(next) {
//     const guidePromises = this.guides.map(
//         async el => await userModel.findById(el)
//     );
//     this.guides = await Promise.all(guidePromises);
//     next();
// });

schema.pre(/^find/, function(next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChnagedAt'
    });
    next();
});

schema.post(/^find/, function(doc, next) {
    console.log(`time took ${Date.now() - this.start}ms`);
    next();
});

// schema.pre('aggregate', function(next) {
//     this.pipeline().unshift({
//         $match: {
//             screteTour: { $ne: true }
//         }
//     });
//     next();
// });

module.exports = mongoose.model('Tours', schema);
