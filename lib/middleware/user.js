var User = require('../user');

module.exports = function(req, res, next) {
    // Check the session for the logged-in user ID
    var uid = req.session.uid;
    if (!uid) return next(); 
    // Get logged-in user's data from Redis
    User.get(uid, function(err, user){
        if (err) return next(err);
        // We store the user info in the request object (req)
        // res.locals is the request-level object that
        //   Express provides to expose data to templates.
        // res is the response object.
        req.user = user;
        res.locals.user = user;
        next();
    });
};