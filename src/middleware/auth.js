/*
 * Authentication Middleware
 *
 */

// Dependencies
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const createError = require('http-errors');
// const passport = require('passport');

const User = require('../models/user');
// const Group = require('../models/group');
// const passportConf  = require('../middleware/passport');


const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);  
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });
        if (!user) {
            throw new Error() 
        }

        // ---------------------------------------------
        // Set the token and user in the request object 
        req.token = token;
        req.user = user;
        // ---------------------------------------------
        
        next();
    } catch (err) {
        res.status(401).send({ error: 'Please authenticate.'});
    }  
};

// using passport
const webAuth = async (req, res, next) => {

    next();

    // if (req.isAuthenticated()) {
    //     return next();
    // }
    // res.redirect('/login');  
};

const adminRole = asyncHandler(async (req, res, next) => {

    next();

    // // req.user should already exist
    // const group = await Group.findOne({ _id: req.user.group })
    //     .populate('roles.role')         // .exec((err, docs) => { console.log(docs) });

    // const roles = group.roles;          // roles array
    // let obj = roles.find(item => item.role.rolename === 'admin');
    // let index = roles.indexOf(obj);     // returns -1 if not found

    // if (req.user && index !== -1) {
    //     next();
    // }
    // else {
    //     throw createError(401, 'Not authorized as an admin');
    // }
});

const webAdminRole = asyncHandler(async (req, res, next) => {

    next();

    // // req.user should already exist
    // const group = await Group.findOne({ _id: req.user.group })
    //     .populate('roles.role')         // .exec((err, docs) => { console.log(docs) });

    // const roles = group.roles;          // roles array
    // let obj = roles.find(item => item.role.rolename === 'admin');
    // let index = roles.indexOf(obj);     // returns -1 if not found

    // if (req.user && index !== -1) {
    //     next();
    // }
    // else {
    //     res.redirect('/');  // TODO: redirect to "401 Unauthorized Page"
    // }
});

module.exports = { auth, webAuth, adminRole, webAdminRole };


// "protect" - for reference
// -------------------------

// const protect = asyncHandler(async (req, res, next) => {
//     let token;

//     if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//         try {
//             token = req.headers.authorization.split(' ')[1];
//             const decoded = jwt.verify(token, process.env.JWT_SECRET);
//             req.user = await User.findById(decoded.id).select('-password');
//             next();
//         }
//         catch (err) {
//             //console.error(err);
//             res.status(401);
//             throw new Error('Not authorized, token failed');
//         }
//     }

//     if (!token) {
//         res.status(401);
//         throw new Error('Not authorized, no token');
//     }
// });