const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const crypto = require('crypto');

const Task = require('../models/task');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    profile: {
        firstname: {type: String, default: ''},
        lastname: {type: String, default: ''},
        description: {type: String, default: ''},
        picture: { type: String, default: ''}
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid.');
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"');
            }
        }
    },
    dob: Date,  // default javascript format '1987-09-28'
    groups: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    }],
    address: String,
    tokens: [{
        token: {
            type: String,
            required: false
        }
    }],
    avatar: {
        type: Buffer
    }
}, 
{
    timestamps: true
});

// virtual relationship mapping
UserSchema.virtual('projects', {
    ref: 'Project',
    localField: '_id',
    foreignField: 'owner'
});

// UserSchema.virtual('files', {
//     ref: 'FileObj',
//     localField: '_id',
//     foreignField: 'owner'
// });

// instance method (invoked by 'user')
UserSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
};

//userSchema.methods.getPublicProfile = function () {   // method1
UserSchema.methods.toJSON = function () {               // method2
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;           // this is too large to be fetched 'GET profile'
    
    return userObject;
};

UserSchema.methods.getPrivateProfile = function () {               
    const user = this;
    const userObject = user.toObject();
    delete userObject.avatar;           // this is too large to be fetched 'GET profile'

    return userObject;
};

// Compare password in db and the one user typed in
UserSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

UserSchema.methods.gravatar = function(size) {
    if (!this.size) size = 200;
    if (!this.email) return 'https://gravatar.com/avatar/?s' + size + '&d=retro';
    var md5 = crypto.createHash('md5').update(this.email).digest('hex');
    return 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro';
};

// static/model method (invoked by 'User')
UserSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw createError(400, `Unable to login`)   // 400 / throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw createError(400, `Unable to login`)   // 400 / throw new Error('Unable to login')
    }

    return user;
};

// Hash the plain text password before saving
UserSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

// Delete user tasks when user has been removed
UserSchema.pre('remove', async function (next) {
    const user = this;
    await Task.deleteMany({ owner: user.id });
    next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;