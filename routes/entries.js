var Entry = require('../lib/entry');

exports.list = function(req, res, next) {
    // Retrieve entries
    Entry.getRange(0, -1, function(err, entries) {
        if (err) return next(err);
        
        // Render HTTP response 
        res.render('entries', {
            title: 'larrykooper.com',
            entries: entries,
        });
         
    });
};

exports.form = function(req, res) {
    res.render('post', {title:'Post'});
};

exports.submit = function(req, res, next) {
    var data = req.body.entry; 
    
    var entry = new Entry({
        "username": res.locals.user.name,
        "title": data.title,
        "body": data.body
    });
    
    entry.save(function(err) {
        if (err) return next(err);
        res.redirect('/');
    });
};

exports.editposts = function(req, res, next) {
    Entry.getRange(0, -1, function(err, entries) {
        if (err) return next(err);
        res.render('edit-posts', {
            title: 'Editing posts',
            entries: entries,
        });
    });
};

exports.edit = function(req, res) {
    res.render('edit-post', {title:'Editing post'});
}
