/* eslint-disable node/no-unsupported-features/es-syntax */
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const schema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'please tell us your name']
        },
        role: {
            type: String,
            enum: ['user', 'admin', 'guide', 'lead-guide'],
            default: 'user'
        },
        email: {
            type: String,
            unique: true,
            required: [true, 'Please provide your email address'],
            lowercase: true,
            validate: [validator.isEmail, 'Please provide a valid email']
        },
        photo: {
            type: String,
            default: 'default.jpg'
        },
        password: {
            type: String,
            minlength: 8,
            required: [true, 'Please provide your password'],
            select: false
        },
        passwordConfirm: {
            type: String,
            validate: {
                validator: function(val) {
                    return this.password === val;
                },
                message: 'password and passwordConfirm are not same'
            },
            required: [true, 'Please confirm your password']
        },
        passwordChangedAt: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
        active: {
            type: Boolean,
            default: true,
            select: false
        }
    },
    { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

schema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

schema.pre('save', function(next) {
    if (!this.isModified('password') || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000;
    next();
});
schema.pre(/^find/, function(next) {
    this.find({ active: { $ne: false } });
    next();
});
schema.methods.correctPassword = async function(hashed, nonHahsed) {
    return await bcrypt.compare(nonHahsed, hashed);
};

schema.methods.changePasswordAfter = async function(jwt) {
    if (this.passwordChangedAt) {
        const changedTimeStamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );
        return jwt < changedTimeStamp;
    }
    return false;
};

schema.methods.createPasswordResetToken = function() {
    const token = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
    console.log({ token }, this.passwordResetToekn);
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return token;
};
module.exports = mongoose.model('users', schema);
