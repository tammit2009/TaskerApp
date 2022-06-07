
/********************************/
/*** Messaging API Controller ***/
/********************************/

// Dependencies
const asyncHandler = require('express-async-handler');
const createError = require('http-errors');

const User = require('../models/user');
const Group = require('../models/group');
const mongoose = require('mongoose')

const { 
    sendDirectEmail
} = require('../emails/account');

/*
 * Create/Register a new User 
 * Method: 'POST', url = '/api/v1/users', Access: 'Public'
 */
const sendEmail = asyncHandler(async (req, res) => {
    const { email, subject, text } = req.body;
    // console.log(req.body);

    // to send mail, user must belong to admin group
    const user = await User.findOne({ _id: req.user._id }).populate('groups');
    const groups = user.groups;
    // console.log(groups);

    const belongsToAdmin = groups.find((group) => group.groupname == 'admin');
    if (!belongsToAdmin) {
        throw createError(400, `You dont belong to admin group`);
    }

    const resp = await sendDirectEmail(email, subject, text);
    // console.log(resp[0].statusCode);

    if (resp[0].statusCode && parseInt(resp[0].statusCode) == 202) {
        res.status(200).send({ message: `email successfully sent to ${email}` });   
    }
    else {
        throw createError(500, `Failed to send email to ${email} `);
    }
    
});


module.exports = { 
    sendEmail
};