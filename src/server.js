///////////////////////////////////////////
require('colors');

// environment config
require('dotenv').config(); 

///////////////////////////////////////////
// module imports
const express = require('express');
const http = require('http');
const path = require('path');
const morgan = require('morgan');  // logging library
const cors = require('cors');
const hbs = require('hbs');
const session = require('express-session');
const cookieParser = require('cookie-parser');  // A cookie stores sessionId; cookieParser puts this on request object
const flash = require('express-flash');         // retains data on redirect
const MongoStore = require('connect-mongo');    // MongoDB session store for Connect and Express    
const passport = require('passport'); 

const connectMongoDb = require('./db/mongoose');
const registerHbsHelpers = require('./utils/hbs_helpers');

const Group = require('./models/group');

const { 
    maintenanceRedirect, 
    printCookies,
    ignoreFavicon,
    notFound,
    errorHandler 
} = require('./middleware/utils');

const webRoutes = require('./routes/webRoutes');
const apiRoutes = require('./routes/apiRoutes');

///////////////////////////////////////////////////
// initializations

connectMongoDb();   // connect mongodb

const app = express();
const server = http.createServer(app);  // in case socketio embed is required
const port = process.env.PORT || 3000;

//////////////////////////////////////////////////////////////////////////////

// define paths for express config
const publicDirPath = path.join(__dirname, '../public');
const viewsPath = path.join(__dirname, '../templates/views');
const partialsPath = path.join(__dirname, '../templates/partials');

// setup static directory to serve
app.use(express.static(publicDirPath));

// setup handlebars engine and views location
app.set('view engine', 'hbs');
app.set('views', viewsPath);
app.set('view options', { layout: 'layouts/main' }); // default layout
hbs.registerPartials(partialsPath);

registerHbsHelpers(hbs);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// middleware

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(cors());                                        // allows requests from one domain to another (e.g. react -> express)
app.use(express.json());                                // enable parsing JSON (replaces body-parser)
app.use(express.urlencoded({ extended: true }));        // enable parsing 'x-www-form-urlencoded' (replaces body-parser)
app.use(cookieParser());                                // add cookie to the request object
app.use(session({
    resave: true,										// forces the session to be saved back to the session store, even if not modified by request
    saveUninitialized: true,							// forces a session that is uninitialized to be saved to the store
    secret: 'superman123$',								// used to sign the session id cookie
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URL })
}));

app.use(flash());
app.use(passport.initialize());                 		// initialize the passport middleware
app.use(passport.session());                    		// for serialize and deserialize

///////////////////////////////////////////////////////////////
// middleware utilities		

// Disable all request at maintenance mode if required
// app.use(maintenanceRedirect);

// Debug/printout the session cookie if needed
// app.get("/*", (req, res, next) => printCookies(req, res, next));

// Add session variables to locals; 'req.user' will be available  
// on all pages based on authentication e.g. passport serialize/deserialize
app.use(function(req, res, next) {
    res.locals.user = req.user;      
    next();
});

// Get the list of all available groups and store into local variable 'groups'
app.use(function(req, res, next) {
    Group.find({}, function(err, groups) {
        if (err) return next(err);
		// groups.map(group => console.log('Group: ' + group));
        res.locals.groups = groups;
        next();
    })
});

// Redirect favicon
app.use('/favicon.ico', express.static(`${publicDirPath}/images/favicon.ico`)); 

///////////////////////////////////////////////////////////////////////////////
// routes:

// session counter test
app.get('/session', (req, res) => {
	if (req.session.page_views) {
		// incrementing the page views counter by 1
		req.session.page_views++;
		res.status(200).json({ info: `Welcome, Visit Counter: ${req.session.page_views}` });
	}
	else {
		// introductory request: setting the page views counter to 1
		req.session.page_views = 1;
		res.status(200).json({ info: 'Welcome for the first time' });
	}
});

app.use('/', 	    webRoutes);
app.use('/api/v1', 	apiRoutes);

///////////////////////////////////////////////////////////////
// error handlers

// Handle 404
app.use(notFound);

// Error middleware
app.use(errorHandler);


///////////////////////////////////////////////////////////////

// startup the server
server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
});

///////////////////////////////////////////////////////////////