
/******************/
/*** API Routes ***/
/******************/

// Dependencies
const express = require('express');
const router = express.Router();
const multer = require('multer');

const { auth, adminRole } = require('../middleware/auth.js');

/*
 * User Routes
 */
const { 
    getUsers, createUser, authUser, userAddGroup, userRemoveGroup, getMyProfile, getUserProfile, 
    updateMyProfile, updateUserProfile, deleteMe, deleteUser, logoutUser, logoutUserAll,
    uploadAvatar, deleteAvatar, getAvatar
} = require('../controllers/userApiController.js');

// Avatar Related Upload...
const upload = multer({
    // dest: 'avatars',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image!'))
        }
        cb(undefined, true)
    }
});

router
    .route('/users')
        .get(auth, adminRole, getUsers)
        .post(createUser);
router  .post('/users/login', authUser);
router  .post('/users/logout', auth, logoutUser);
router  .post('/users/logoutAll', auth, logoutUserAll);        
router
    .route('/users/me')
        .get(auth, getMyProfile)
        .patch(auth, updateMyProfile)
        .delete(auth, deleteMe);  
router
    .route('/users/me/avatar')
        .post(auth, upload.single('avatar'), uploadAvatar)  // 'form-data' field name should be 'avatar'
        .delete(auth, deleteAvatar);
router.get('/users/me/avatar/:id', getAvatar);
router
    .route('/users/profile/:id')
        .get(auth, adminRole, getUserProfile)   
        .patch(auth, adminRole, updateUserProfile);
router
    .route('/users/groups')
        .post(auth, adminRole, userAddGroup)     
        .delete(auth, adminRole, userRemoveGroup)  
router
    .route('/users/:id')
        .delete(auth, adminRole, deleteUser);


/*
 * Group Routes
 */
const { 
    getGroups, createGroup, groupAddRole, groupRemoveRole, getGroup, updateGroup, deleteGroup
} = require('../controllers/groupApiController.js');

router
    .route('/groups')
        .get(auth, adminRole, getGroups)             
        .post(/*auth, adminRole,*/ createGroup);
router
    .route('/groups/roles')
        .post(/*auth, adminRole,*/ groupAddRole)     
        .delete(auth, adminRole, groupRemoveRole)  
router
    .route('/groups/:id')
        .get(auth, adminRole, getGroup)             
        .patch(auth, adminRole, updateGroup)
        .delete(auth, adminRole, deleteGroup);   
       

/*
 * Role Routes
 */
const { 
    getRoles, createRole, getRole, updateRole, deleteRole
} = require('../controllers/roleApiController.js');

router
    .route('/roles')
        .get(auth, adminRole, getRoles)             
        .post(/*auth, adminRole,*/ createRole);
router
    .route('/roles/:id')
        .get(auth, adminRole, getRole)             
        .patch(auth, adminRole, updateRole)
        .delete(auth, adminRole, deleteRole);   


/*
 * Project Routes
 */
const { 
    createProject, projectAddTask, projectRemoveTask, getProjects, getProject, 
    updateProject, deleteProject
} = require('../controllers/projectApiController.js');

router
    .route('/projects')
        .get(auth, getProjects)             
        .post(auth, createProject);
router
    .route('/projects/tasks')
        .post(auth, adminRole, projectAddTask)     
        .delete(auth, adminRole, projectRemoveTask)  
router
    .route('/projects/:id')
        .get(auth, getProject)             
        .patch(auth, updateProject)
        .delete(auth, deleteProject);   


/*
 * Task Routes
 */
const { 
    getTasks, createTask, getTask, updateTask, deleteTask
} = require('../controllers/taskApiController.js');

router
    .route('/tasks')
        .get(auth, getTasks);
router
    .route('/tasks/projects/:id')             
        .post(auth, createTask)
router
    .route('/tasks/:id')             
        .get(auth, getTask)             
        .patch(auth, updateTask)
        .delete(auth, deleteTask);  


/*
 * Productivity Routes
 */
const { 
    createProductivity, getProductivities, getProductivity, updateProductivity, deleteProductivity
} = require('../controllers/productivityApiController.js');

// router
//     .route('/productivities')
//         .get(auth, getProductivities)             
router
    .route('/productivities/tasks/:id')  
        .get(auth, getProductivities)        
        .post(auth, createProductivity); 
router
    .route('/productivities/:id')
        .get(auth, getProductivity)
        .patch(auth, updateProductivity)
        .delete(auth, deleteProductivity);  


/*
 * Messaging Routes
 */
const { 
    sendEmail
} = require('../controllers/messagingApiController.js');

router
    .route('/messages/sendmail')
        .post(auth, sendEmail);

// Exports
module.exports = router;