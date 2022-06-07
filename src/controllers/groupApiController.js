
/***************************/
/*** Group API Controller ***/
/***************************/

// Dependencies
const asyncHandler = require('express-async-handler');
const createError = require('http-errors');

const Group = require('../models/group');
const Role = require('../models/role');

/*
 * Create a new group
 * Method: 'POST', url = '/api/v1/groups', Access: 'Private/Admin'
 */
const createGroup = asyncHandler(async (req, res) => {
    const { groupname, description } = new Group(req.body);
    const group = await Group.create({ groupname, description });
    await group.save();
    res.status(201).send(group);  
}); 


/*
 * Add Role to Group
 * Method: 'POST', url = '/api/v1/groups/roles', Access: 'Private/Admin'
 */
const groupAddRole = asyncHandler(async (req, res) => {
    const { groupid, roleid } = req.body;
    const group = await Group.findOne({ _id: groupid });
    const role = await Role.findOne({ _id: roleid });
    if (!group || !role) {
        throw createError(404, `Not Found`);    
    }

    // Check if the role or group already exists in either collection
    const roleExists = group.roles.includes(role._id);
    const groupExists = role.groups.includes(group._id);
    if (roleExists || groupExists) {
        throw createError(400, `Role already exists in group`)   
    }

    group.roles = group.roles.concat(role._id);
    await group.save();
    role.groups = role.groups.concat(group._id);
    await role.save(); 

    // res.status(200).send({ group, role });
    res.status(204).send({ group, role });
}); 


/*
 * Remove Role to Group
 * Method: 'DELETE', url = '/api/v1/groups/roles', Access: 'Private/Admin'
 */
const groupRemoveRole = asyncHandler(async (req, res) => {
    const { groupid, roleid } = req.body;

    const group = await Group.findOne({ _id: groupid });
    const role = await Role.findOne({ _id: roleid });
    if (!group || !role) {
        throw createError(404, `Not Found`);    
    }

    // Check if the role exists in the group
    const roleExists = group.roles.includes(role._id);
    const groupExists = role.groups.includes(group._id);
    if (!roleExists && !groupExists) {
        throw createError(400, `Role does not exists in group`)   
    }

    if (roleExists) {
        group.roles = group.roles.filter((roleid) => !roleid.equals(role._id));
        await group.save();
    }
    
    if (groupExists) {
        role.groups = role.groups.filter((groupid) => !groupid.equals(group._id));
        await role.save(); 
    }
    
    // res.send({ group, role });
    res.status(204).send({ group, role });
}); 

/*
 * Read all groups 
 * Method: 'GET', url = '/api/v1/groups', Access: 'Private/Admin'
 * Parameterized:
 *  - Pagination: GET /groups?limit=10&skip=10
 *  - Sort:       GET /groups?sortBy=createdAt:desc
 */
const getGroups = asyncHandler(async (req, res) => {
    const sort = {};

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    // Method 1
    // const groups = await Group.find({}, null, {
    //     limit: parseInt(req.query.limit),
    //     skip: parseInt(req.query.skip),
    //     sort
    // }); 
                                         
    // method 2
    const groups = await Group.find({}).populate({
        path: 'roles',
        options: {
            limit: parseInt(req.query.limit),
            skip: parseInt(req.query.skip),
            sort
        }
    });    
    
    res.send(groups);   
}); 


/*
 * View a Specific group
 * Method: 'GET', url = '/api/v1/groups/:id', Access: 'Private/Admin'
 */
const getGroup = asyncHandler(async (req, res) => {
    const _id = req.params.id;
    const group = await Group.findOne({ _id });
    if (!group) {
        throw createError(404, `Not Found`);    
    }
    res.send(group);                         
}); 


/*
 * Update a specific group
 * Method: 'PATCH', url = '/api/v1/groups/:id', Access: 'Private/Admin'
 */
const updateGroup = asyncHandler(async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['groupname', 'description', 'roles'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        throw createError(400, `Bad Request: Invalid Fields for Update`);    
    }

    try {
        const group = await Group.findOne({ _id: req.params.id });   
        if (!group) {
            throw createError(404, `Not Found`);  
        }

        updates.forEach((update) => group[update] = req.body[update]);
        await group.save();
        res.send(group);                         
    } catch (err) {
        throw createError(400, err.message);   
    }
}); 


/*
 * Delete a specific group
 * Method: 'DELETE', url = '/api/v1/groups/:id', Access: 'Private/Admin'
 */
const deleteGroup = asyncHandler(async (req, res) => {
    const group = await Group.findOneAndDelete({ _id: req.params.id });

    if (!group) {
        throw createError(404, `Not Found`);            // Bad Request -> res.status(404).send();        
    }
    res.send(group);
}); 


module.exports = { 
    getGroups,
    createGroup,
    groupAddRole,
    groupRemoveRole,
    getGroup,
    updateGroup,
    deleteGroup
};