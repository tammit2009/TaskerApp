
// Disable all request at maintenance mode if required
exports.maintenanceRedirect = function (req, res, next) {
    return res.status(503).send('Site is currently down, check back soon');
};

// Debug/printout the session cookie if needed
exports.printCookies = function(req, res, next) {
    if (typeof req.cookies['connect.sid'] !== 'undefined') {
        console.log('COOKIE: ' + req.cookies['connect.sid']);
    }
    next();  // call the next middleware
};

exports.ignoreFavicon = (req, res, next) => {    
    //if (req.originalUrl.includes('favicon.ico')) {
    if (req.originalUrl && req.originalUrl.split("/").pop() === 'favicon.ico') {
        return res.status(204).end();
    }
    next();
};

exports.notFound = (req, res, next) => {
    res.status(404);
    const error = new Error(`Not Found - ${req.originalUrl}`);
    next(error);
};

// Works with asynchandler - errors to requests will be piped here
exports.errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? ( err.statusCode ? err.statusCode : 500 ) : res.statusCode;
    res.status(statusCode);

    switch (statusCode) {
        // case 404:
        //     // render 404 
        //     return res.render('404', {  
        //         title: '404',
        //         errorMessage: `Not Found - ${req.originalUrl}`
        //     });
        default:
            return res.json({
                message: err.message,
                stack: process.env.NODE_ENV === 'production' ? null : err.stack
            });
    }
};
