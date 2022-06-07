
/***************************/
/*** User API Controller ***/
/***************************/

const asyncHandler  = require('express-async-handler');
const createError   = require('http-errors');
const sharp         = require('sharp');
const async         = require('async');

const User = require('../models/user');
const Group = require('../models/group');

const { 
    sendWelcomeEmail, 
    sendCancellationEmail 
} = require('../emails/account');

/*
 * Create/Register a new User 
 * Method: 'POST', url = '/api/v1/users', Access: 'Public'
 */
const createUser = asyncHandler(async (req, res) => {
    // const { username, email, password, groupId } = new User(req.body);
    const { username, email, password } = new User(req.body);

    // set default group initially
    // TODO: add initialization with a group(s) but later
    const basicGroup = await Group.findOne({ groupname: 'basic' })
    if (!basicGroup) {
        throw createError(500, `Server Error: Unable to Create User`)   
    }

    const userEmailExists = await User.findOne({ email });
    if (userEmailExists) {
        throw createError(400, `Email already exists`)   
    }

    const userNameExists = await User.findOne({ username });
    if (userNameExists) {
        throw createError(400, `Username already exists`)   
    }

    const user = await User.create({ username, email, password, groups: [basicGroup._id] });
    // user.groups = user.groups.concat( basicGroup._id );
    await user.save();

    basicGroup.users = basicGroup.users.concat( user._id );
    await basicGroup.save();

    // sendWelcomeEmail(user.email, user.username);

    const token = await user.generateAuthToken();

    res.status(201).send({ user, token });              
});


/*
 * Login a user 
 * Method: 'POST', url = '/api/v1/users/login', Access: 'Public'
 * Note: Sensitive information is filtered with 'userSchema.methods.toJSON()' 
 */
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findByCredentials(email, password);
    const token = await user.generateAuthToken();
    res.send({ user, token });                          
}); 


/*
 * Add Group to User
 * Method: 'POST', url = '/api/v1/users/groups', Access: 'Private/Admin'
 */
const userAddGroup = asyncHandler(async (req, res) => {

    const { userid, groupid } = req.body;

    const user = await User.findOne({ _id: userid });
    const group = await Group.findOne({ _id: groupid });
    if (!group || !user) {
        throw createError(404, `Not Found`);    
    }

    // Check if the user or group already exists in either collection
    const userExists = group.users.includes(user._id);
    const groupExists = user.groups.includes(group._id);
    if (userExists || groupExists) {
        throw createError(400, `Group already exists in user collection`)   
    }

    group.users = group.users.concat(user._id);
    await group.save();
    user.groups = user.groups.concat(group._id);
    await user.save(); 

    // res.status(200).send({ group, user });
    res.status(204).send({ group, user });
}); 


/*
 * Remove Group from User
 * Method: 'DELETE', url = '/api/v1/users/groups', Access: 'Private/Admin'
 */
const userRemoveGroup = asyncHandler(async (req, res) => {

    const { userid, groupid } = req.body;

    const group = await Group.findOne({ _id: groupid });
    const user = await User.findOne({ _id: userid });
    if (!group || !user) {
        throw createError(404, `Not Found`);    
    }

    // Check if the group exists in the user collection
    const userExists = group.users.includes(user._id);
    const groupExists = user.groups.includes(group._id);
    if (!userExists && !groupExists) {
        throw createError(400, `Group does not exists in user collection`)   
    }

    if (userExists) {
        group.users = group.users.filter((userid) => !userid.equals(user._id));
        await group.save();
    }
    
    if (groupExists) {
        user.groups = user.groups.filter((groupid) => !groupid.equals(group._id));
        await user.save(); 
    }
    
    // res.send({ group, user });
    res.status(204).send({ group, user });
}); 


/*
 * Fetch this user's details  
 * Method: 'GET', url = '/api/v1/users/me', Access: 'Private'
 */
const getMyProfile = asyncHandler(async (req, res) => {
    res.send(req.user);                                 // 200 / User OK
}); 


/*
 * Fetch a specific user's details  
 * Method: 'GET', url = '/api/v1/users/profile/:id', Access: 'Private/Admin'
 */
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');   
    if (user) {
        res.json(user);                                 // 200 / User OK
    }
    else {
        throw createError(404, `User not found`)        // 404 / User not found
    }                                 
});   


/*
 * Update this user's profile 
 * Method: 'PATCH', url = '/api/v1/users/me', Access: 'Private'
 */
const updateMyProfile = asyncHandler(async (req, res) => {   

    // Handle properties that dont exist
    const updates = Object.keys(req.body);
    const allowedUpdates = ['username', 'profile', 'password', 'address', 'dob'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    // Handle profile subdata
    const allowedProfileData = ['firstname', 'lastname', 'description', 'picture'];
    let isValidProfileData = true;
    if (updates.includes('profile')) {
        const profile_updates = Object.keys(req.body.profile);
        isValidProfileData = profile_updates.every((update) => allowedProfileData.includes(update));
    }

    if (!isValidOperation || !isValidProfileData) throw createError(400, `Invalid Updates!`);  

    try {    
        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();
        res.send(req.user);                                

    } catch (err) {
        throw createError(404, `User not found`)          // 400 / Bad Request  // res.status(400).send(); 
    }
}); 


/*
 * Update a specific user's profile 
 * => Method: 'PATCH', url = '/api/v1/users/profile/:id', Access: 'Private/Admin'
 */
const updateUserProfile = asyncHandler(async (req, res) => { 

    // Handle properties that dont exist
    const updates = Object.keys(req.body);
    const allowedUpdates = ['username', 'profile', 'password', 'address', 'dob'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    // Handle profile subdata
    const allowedProfileData = ['firstname', 'lastname', 'description', 'picture'];
    let isValidProfileData = true;
    if (updates.includes('profile')) {
        const profile_updates = Object.keys(req.body.profile);
        isValidProfileData = profile_updates.every((update) => allowedProfileData.includes(update));
    }

    if (!isValidOperation || !isValidProfileData) throw createError(400, `Invalid Updates!`); 

    const user = await User.findById(req.params.id).select('-password');

    if (user) {
        updates.forEach(update => user[update] = req.body[update]);
        await user.save();

        // TODO: is there a need to clear and regenerate tokens?

        res.send(user);                                     
    }
    else {
        throw createError(404, `User not found`)            // 400 / Bad Request  // res.status(400).send(); 
    }
}); 


/*
 * Delete self user 
 * => Method: 'DELETE', url = '/api/v1/users/me', Access: 'Private'
 */
const deleteMe = asyncHandler(async (req, res) => {
    await req.user.remove();
    res.status(200).json({ message: 'User removed' });                  // 200 / OK
});


/*
 * Delete a specific user's profile 
 * => Method: 'DELETE', url: '/api/v1/users/:id', Access: 'Private/Admin'
 */
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    
    if (user) {
        await user.remove();
        res.json({ message: 'User removed' });
    }   
    else {
        throw createError(404, `User not found`);
    }
});


/*
 * Logout user
 * => Method: 'POST', url: '/api/v1/users/logout', Access: 'Private'
 */
const logoutUser = asyncHandler(async (req, res) => {
    req.user.tokens = req.user.tokens.filter((token) => {
        return token.token !== req.token;
    })
    await req.user.save();
    res.send();             // 200 / OK
});


/*
 * Logout all sessions and clear all active tokens 
 * => Method: 'POST', url: '/api/v1/users/logoutAll', Access: 'Private'
 */
const logoutUserAll = asyncHandler(async (req, res) => {
    req.user.tokens = [];
    await req.user.save();
    res.send();             // 200 / OK
});


/*
 * List All Users 
 * Method: 'GET', url = '/api/v1/users', Access: 'Private/Admin'
 */
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.json(users);    // '200 / OK'
}); 


/*
 * Upload avatar for this user 
 * => Method: 'POST', url: '/users/me/avatar', Access: 'Private'
 */
const uploadAvatar = asyncHandler(async (req, res) => {
    const buffer = await sharp(req.file.buffer)
                            .resize({ width: 250, height: 250 }) // resize image
                            .png().toBuffer()                    // convert to '.png' format
    req.user.avatar = buffer
    await req.user.save()
    res.send()
});


/*
 * Delete avatar for this user 
 * => Method: 'DELETE', url: '/users/me/avatar', Access: 'Private'
 */
const deleteAvatar = asyncHandler(async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
});


/*
 * Read avatar for this user 
 * => Method: 'GET', url: '/users/me/avatar/:id', Access: 'Public'
 */
const getAvatar = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
        throw new Error()
    }
    res.set('Content-Type', 'image/png')
    res.send(user.avatar)
});


module.exports = { 
    getUsers,
    createUser,
    authUser,
    userAddGroup,
    userRemoveGroup,
    getMyProfile,
    getUserProfile,
    updateMyProfile,
    updateUserProfile,
    deleteMe,
    deleteUser,
    logoutUser,
    logoutUserAll,
    uploadAvatar,
    deleteAvatar,
    getAvatar
};