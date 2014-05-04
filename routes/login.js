var User = require('../lib/user');

exports.form = function(req, res) {
    res.render('login', {title: 'Login'});
};

exports.submit = function(req, res, next) {
    var data = req.body.user; 
    User.authenticate(data.name, data.pass, function(err, user) {
        // Delegate errors
        if (err) return next(err);
        if (user) {
            // Store uid 
            req.session.uid = user.id;
            // Redirect to entry listing 
            res.redirect('/');
        } else {
            res.error("Sorry! invalid credentials.");
            res.redirect('back');
        }
    });
};

exports.logout = function(req, res) {
    req.session.destroy(function (err) {
        if (err) throw err;
        res.redirect('/');
    });
};
