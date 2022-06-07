
/***************************/
/*** Task API Controller ***/
/***************************/

// Dependencies
const asyncHandler = require('express-async-handler');
const createError = require('http-errors');

const Task = require('../models/task');
const Project = require('../models/project');

/*
 * Create a new task for specific project
 * Method: 'POST', url = '/api/v1/tasks/projects/:id', Access: 'Private'
 */
const createTask = asyncHandler(async (req, res) => {
    const projectid = req.params.id;

    // ensure the project is owned by the user
    const project = await Project.findOne({ _id: projectid, owner: req.user._id });
    if (!project) {
        throw createError(404, `Not Found`);    
    }

    const task = new Task({ 
        ...req.body,
        project: projectid
    });

    try {
        await task.save();
        res.status(201).send(task);         
    } catch (err) {
        throw createError(400, `Bad Request`)   
    }
}); 


/*
 * Read all tasks for this user (i.e. across all user's projects)
 * Method: 'GET', url = '/api/v1/tasks', Access: 'Private'
 * Parameterized:
 *  - Search:     GET /tasks?completed=true
 *  - Pagination: GET /tasks?limit=10&skip=10
 *  - Sort:       GET /tasks?sortBy=createdAt:desc
 */
const getTasks = asyncHandler(async (req, res) => {
    const match = {};
    const sort = {};

    if (req.query.completed) {
        match.completed = req.query.completed === 'true';
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    // const projects = await Project.find({ owner: req.user._id }).populate('tasks'); // now works
    const projects = await Project.find({ owner: req.user._id })
    const projectids = projects.map((project) => project._id);
    const tasks = await Task.find({ 'project': { $in: [ ...projectids ] } }, null, {
        match,
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort
    });

    // manual way of doing it:
    // for (let i=0; i < projects.length; i++) {
    //     const _tasks = await Task.find({ project: projects[i]._id });
    //     tasks = tasks.concat(_tasks);
    // }
    // res.send(tasks.slice(skip, limit+1));      

    res.send(tasks); 
}); 


/*
 * View a Specific task for this user
 * Method: 'GET', url = '/api/v1/tasks/:id', Access: 'Private'
 */
const getTask = asyncHandler(async (req, res) => {
    const _id = req.params.id;
    const projects = await Project.find({ owner: req.user._id })
    const projectids = projects.map((project) => project._id);
    // const task = await Task.findOne({ _id, owner: req.user._id });
    const task = await Task.findOne({ _id, 'project': { $in: [ ...projectids ] } });
    if (!task) {
        throw createError(404, `Not Found`);    
    }
    res.send(task);                         
}); 


/*
 * Update a specific task for this user
 * Method: 'PATCH', url = '/api/v1/tasks/:id', Access: 'Private'
 */
const updateTask = asyncHandler(async (req, res) => {
    const _id = req.params.id;
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        throw createError(400, `Bad Request: Invalid Fields for Update`);    
    }

    try {
        const projects = await Project.find({ owner: req.user._id })
        const projectids = projects.map((project) => project._id);
        const task = await Task.findOne({ _id, 'project': { $in: [ ...projectids ] } });
        if (!task) {
            throw createError(404, `Not Found`);  
        }

        updates.forEach((update) => task[update] = req.body[update]);
        await task.save();
        res.send(task);                         // OK
    } catch (err) {
        throw createError(400, err.message);    // Bad Request
    }
}); 


/*
 * Delete a specific task for this user
 * Method: 'DELETE', url = '/api/v1/tasks/:id', Access: 'Private'
 */
const deleteTask = asyncHandler(async (req, res) => {
    const projects = await Project.find({ owner: req.user._id })
    const projectids = projects.map((project) => project._id);
    const task = await Task.findOneAndDelete({ _id: req.params.id, 'project': { $in: [ ...projectids ] } });

    if (!task) {
        throw createError(404, `Not Found`);            // Bad Request -> res.status(404).send();        
    }
    res.send(task);
}); 


module.exports = { 
    getTasks,
    createTask,
    getTask,
    updateTask,
    deleteTask
};