
/******************************/
/*** Project API Controller ***/
/******************************/

// Dependencies
const asyncHandler = require('express-async-handler');
const createError = require('http-errors');

const Project = require('../models/project');

/*
 * Create a new project for this user
 * Method: 'POST', url = '/api/v1/projects', Access: 'Private'
 */
const createProject = asyncHandler(async (req, res) => {

    const project = new Project({ 
        ...req.body,
        owner: req.user._id
    });

    try {
        await project.save();
        res.status(201).send(project);         
    } catch (err) {
        throw createError(400, `Bad Request`)   
    }
}); 


/*
 * Add Task to Project
 * Method: 'POST', url = '/api/v1/projects/tasks', Access: 'Private'
 */
const projectAddTask = asyncHandler(async (req, res) => {

    console.log(req.body);

    // const { userid, groupid } = req.body;

    // const user = await User.findOne({ _id: userid });
    // const group = await Group.findOne({ _id: groupid });
    // if (!group || !user) {
    //     throw createError(404, `Not Found`);    
    // }

    // // Check if the user or group already exists in either collection
    // const userExists = group.users.includes(user._id);
    // const groupExists = user.groups.includes(group._id);
    // if (userExists || groupExists) {
    //     throw createError(400, `Group already exists in user collection`)   
    // }

    // group.users = group.users.concat(user._id);
    // await group.save();
    // user.groups = user.groups.concat(group._id);
    // await user.save(); 

    // // res.status(200).send({ group, user });
    // res.status(204).send({ group, user });
    res.send();
}); 


/*
 * Remove Task from Project
 * Method: 'DELETE', url = '/api/v1/users/groups', Access: 'Private'
 */
const projectRemoveTask = asyncHandler(async (req, res) => {

    console.log(req.body);

    // const { userid, groupid } = req.body;

    // const group = await Group.findOne({ _id: groupid });
    // const user = await User.findOne({ _id: userid });
    // if (!group || !user) {
    //     throw createError(404, `Not Found`);    
    // }

    // // Check if the group exists in the user collection
    // const userExists = group.users.includes(user._id);
    // const groupExists = user.groups.includes(group._id);
    // if (!userExists && !groupExists) {
    //     throw createError(400, `Group does not exists in user collection`)   
    // }

    // if (userExists) {
    //     group.users = group.users.filter((userid) => !userid.equals(user._id));
    //     await group.save();
    // }
    
    // if (groupExists) {
    //     user.groups = user.groups.filter((groupid) => !groupid.equals(group._id));
    //     await user.save(); 
    // }
    
    // // res.send({ group, user });
    // res.status(204).send({ group, user });
    res.send();
}); 


/*
 * Read all projects for this user
 * Method: 'GET', url = '/api/v1/projects', Access: 'Private'
 * Parameterized:
 *  - Search:     GET /projects?completed=true
 *  - Pagination: GET /projects?limit=10&skip=10
 *  - Sort:       GET /projects?sortBy=createdAt:desc
 */
const getProjects = asyncHandler(async (req, res) => {

    const match = {};
    const sort = {};

    if (req.query.completed) {
        match.completed = req.query.completed === 'true';
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    // Method 1
    // const projects = await Project.find({ owner: req.user._id }); 
    // res.send(projects);                                        

    // method 2
    await req.user.populate({
        path: 'projects',
        match,
        options: {
            limit: parseInt(req.query.limit),
            skip: parseInt(req.query.skip),
            sort
        }
    });    

    res.send(req.user.projects);         
}); 


/*
 * View a Specific project for this user
 * Method: 'GET', url = '/api/v1/projects/:id', Access: 'Private'
 */
const getProject = asyncHandler(async (req, res) => {
    const _id = req.params.id;
    const project = await Project.findOne({ _id, owner: req.user._id });
    if (!project) {
        throw createError(404, `Not Found`);    
    }
    res.send(project);    
}); 


/*
 * Update a specific project for this user
 * Method: 'PATCH', url = '/api/v1/projects/:id', Access: 'Private'
 */
const updateProject = asyncHandler(async (req, res) => {

    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        throw createError(400, `Bad Request: Invalid Fields for Update`);    
    }

    try {
        const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });   
        if (!project) {
            throw createError(404, `Not Found`);  
        }

        updates.forEach((update) => project[update] = req.body[update]);
        await project.save();
        res.send(project);                         
    } catch (err) {
        throw createError(400, err.message);    
    }
}); 


/*
 * Delete a specific project for this user
 * Method: 'DELETE', url = '/api/v1/projects/:id', Access: 'Private'
 */
const deleteProject = asyncHandler(async (req, res) => {
    const project = await Project.findOneAndDelete({ _id: req.params.id, owner: req.user._id});
	
	// TODO: delete all associated tasks too

    if (!project) {
        throw createError(404, `Not Found`);            // Bad Request -> res.status(404).send();        
    }
    res.send(project);
}); 


module.exports = { 
    createProject,
    projectAddTask, 
    projectRemoveTask,
    getProjects,
    getProject,
    updateProject,
    deleteProject
};