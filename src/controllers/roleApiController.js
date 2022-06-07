
/***************************/
/*** Role API Controller ***/
/***************************/

// Dependencies
const asyncHandler = require('express-async-handler');
const createError = require('http-errors');

const Role = require('../models/role');

/*
 * Create a new role
 * Method: 'POST', url = '/api/v1/roles', Access: 'Private/Admin'
 */
const createRole = asyncHandler(async (req, res) => {
    const { rolename, description } = new Role(req.body);
    const role = await Role.create({ rolename, description });
    await role.save();
    res.status(201).send(role);  
}); 


/*
 * Read all roles 
 * Method: 'GET', url = '/api/v1/roles', Access: 'Private/Admin'
 * Parameterized:
 *  - Pagination: GET /roles?limit=10&skip=10
 *  - Sort:       GET /roles?sortBy=createdAt:desc
 */
const getRoles = asyncHandler(async (req, res) => {
    const sort = {};

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    // Method 1
    const roles = await Role.find({}, null, {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort
    }); 

    res.send(roles);                                        

    // // method 2
    // await req.user.populate({
    //     path: 'tasks',
    //     match,
    //     options: {
    //         limit: parseInt(req.query.limit),
    //         skip: parseInt(req.query.skip),
    //         sort
    //     }
    // });    
    // res.send(req.user.tasks);                                    
}); 


/*
 * View a Specific role
 * Method: 'GET', url = '/api/v1/roles/:id', Access: 'Private/Admin'
 */
const getRole = asyncHandler(async (req, res) => {
    const _id = req.params.id;
    const role = await Role.findOne({ _id });
    if (!role) {
        throw createError(404, `Not Found`);    
    }
    res.send(role);                         
}); 


/*
 * Update a specific role
 * Method: 'PATCH', url = '/api/v1/roles/:id', Access: 'Private/Admin'
 */
const updateRole = asyncHandler(async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['rolename', 'description', 'groups'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        throw createError(400, `Bad Request: Invalid Fields for Update`);    
    }

    try {
        const role = await Role.findOne({ _id: req.params.id });   
        if (!role) {
            throw createError(404, `Not Found`);  
        }

        updates.forEach((update) => role[update] = req.body[update]);
        await role.save();
        res.send(role);                         
    } catch (err) {
        throw createError(400, err.message);   
    }
}); 


/*
 * Delete a specific role
 * Method: 'DELETE', url = '/api/v1/roles/:id', Access: 'Private/Admin'
 */
const deleteRole = asyncHandler(async (req, res) => {
    const role = await Role.findOneAndDelete({ _id: req.params.id });

    if (!role) {
        throw createError(404, `Not Found`);            // Bad Request -> res.status(404).send();        
    }
    res.send(role);
}); 


module.exports = { 
    createRole,
    getRoles,
    getRole,
    updateRole,
    deleteRole
};