/******************/
/*** Web Routes ***/
/******************/

// Dependencies
const express = require('express');
const router = express.Router();
const passport = require('passport');
const passportConf  = require('../middleware/passport');

const { 
    auth, 
    webAuth,
    adminRole,
    webAdminRole 
} = require('../middleware/auth.js');

const { 
    getHomePage,
    getWorkspacePage,
    getAboutPage,
    getContactPage,
    getServicesPage,
    getLoginPage,
    getRegisterPage,
    webRegisterUser,
    getProfilePage,
    getEditProfilePage,
    editProfileWeb,
    logoutUserWeb
} = require('../controllers/webController.js');


// routes
router.get('/',             getHomePage);
router.get('/workspace',    webAuth, webAdminRole, getWorkspacePage);
router.get('/about',        getAboutPage);
router.get('/contact',      getContactPage);
router.get('/services',     getServicesPage);
router
    .route('/login')
        .get(getLoginPage)
        .post( 
            // use Passport middleware for actual login
            passport.authenticate('local-login', {
                successRedirect: '/workspace',
                failureRedirect: '/login',
                failureFlash: true }));
router
    .route('/register')
        .get(getRegisterPage)
        .post(webRegisterUser);
router.get('/profile', passportConf.isAuthenticated, getProfilePage); // use "webAuth" here instead
router.route('/edit_profile')
        .get(getEditProfilePage)
        .post(editProfileWeb);
router.get('/logout', logoutUserWeb);


// Exports
module.exports = router;