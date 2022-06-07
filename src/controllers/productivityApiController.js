
/***********************************/
/*** Productivity API Controller ***/
/***********************************/

// Dependencies
const asyncHandler = require('express-async-handler');
const createError = require('http-errors');

const Project = require('../models/project');
const Task = require('../models/task');
const Productivity = require('../models/productivity');

/*
 * Create a new productivities for a task
 * Method: 'POST', url = '/api/v1/productivities/tasks/:id', Access: 'Private'
 */
const createProductivity = asyncHandler(async (req, res) => {
    const taskid = req.params.id;

    // ensure the productivity is owned by the user
    const task = await Task.findOne({ _id: taskid });
    const project = await Project.findOne({ _id: task.project, owner: req.user._id });
    if (!project) {
        throw createError(404, `Not Found`);    
    }

    const productivity = new Productivity({ 
        ...req.body,
        task: taskid
    });

    try {
        await productivity.save();
        res.status(201).send(productivity);         
    } catch (err) {
        throw createError(400, `Bad Request`)   
    }
}); 


/*
 * Read all productivities for a task
 * Method: 'GET', url = '/api/v1/productivities/tasks/:id', Access: 'Private'
 * Parameterized:
 *  - Search:     GET /productivities?completed=true
 *  - Pagination: GET /productivities?limit=10&skip=10
 *  - Sort:       GET /productivities?sortBy=createdAt:desc
 */
const getProductivities = asyncHandler(async (req, res) => {
    const taskid = req.params.id;

    const match = {};
    const sort = {};

    if (req.query.completed) {
        match.completed = req.query.completed === 'true';
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    // ensure the productivity is owned by the user
    const task = await Task.findOne({ _id: taskid });    
    const project = await Project.findOne({ _id: task.project, owner: req.user._id });
    if (!project) {
        throw createError(404, `Not Found`);    
    }

    const productivities = await Productivity.find({ task: taskid }, null, {
        match,
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort
    });

    res.send(productivities);    
}); 


/*
 * View a Specific productivity 
 * Method: 'GET', url = '/api/v1/productivities/:id', Access: 'Private'
 */
const getProductivity = asyncHandler(async (req, res) => {
    const _id = req.params.id;
    const productivity = await Productivity.findOne({ _id });
    if (!productivity) {
        throw createError(404, `Not Found`);    
    }

    // ensure the productivity is owned by the user
    const task = await Task.findOne({ _id: productivity.task });  
    if (!task) {
        throw createError(404, `Not Found`);    
    }

    const project = await Project.findOne({ _id: task.project, owner: req.user._id });
    if (!project) {
        throw createError(404, `Not Found`);    
    }
    else {
        res.send(productivity); 
    }
}); 


/*
 * Update a specific productivity 
 * Method: 'PATCH', url = '/api/v1/productivities/:id', Access: 'Private'
 */
const updateProductivity = asyncHandler(async (req, res) => {

    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed', 'task'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        throw createError(400, `Bad Request: Invalid Fields for Update`);    
    }

    try {
        const productivity = await Productivity.findOne({ _id: req.params.id });
        if (!productivity) {
            throw createError(404, `Not Found`);  
        }

        // ensure the productivity is owned by the user
        const task = await Task.findOne({ _id: productivity.task });  
        if (!task) {
            throw createError(404, `Not Found`);    
        }

        const project = await Project.findOne({ _id: task.project, owner: req.user._id });
        if (!project) {
            throw createError(404, `Not Found`);    
        }
        else {
            updates.forEach((update) => productivity[update] = req.body[update]);
            await productivity.save();
            res.send(productivity); 
        }
    } catch (err) {
        throw createError(400, err.message);    // Bad Request
    }
}); 


/*
 * Delete a specific productivity for a task
 * Method: 'DELETE', url = '/api/v1/productivities/:id', Access: 'Private'
 */
const deleteProductivity = asyncHandler(async (req, res) => {

    // const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id});

    // if (!task) {
    //     throw createError(404, `Not Found`);            // Bad Request -> res.status(404).send();        
    // }
    // res.send(task);

    const productivity = await Productivity.findOne({ _id: req.params.id });
    if (!productivity) {
        throw createError(404, `Not Found`);  
    }

    // ensure the productivity is owned by the user
    const task = await Task.findOne({ _id: productivity.task });  
    if (!task) {
        throw createError(404, `Not Found`);    
    }

    const project = await Project.findOne({ _id: task.project, owner: req.user._id });
    if (!project) {
        throw createError(404, `Not Found`);    
    }
    else {
        const removed = await Productivity.deleteOne({ _id: productivity._id }); // { acknowledged: true, deletedCount: 1 }
        res.send(productivity); 
    }
}); 


module.exports = { 
    createProductivity,
    getProductivities,
    getProductivity,
    updateProductivity,
    deleteProductivity
};