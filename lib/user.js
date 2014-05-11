var redis = require('redis');
var bcrypt = require('bcrypt');
// create long-running Redis connection
//var db = redis.createClient();
var db = redis.createClient('6379', process.env.REDIS_IP);

// Export User function from the module
module.exports = User;

function User(obj) {
    // merge object properties into User's properties
    for (var key in obj) {
        this[key] = obj[key];
    }
}

User.prototype.save = function(fn) {
    if (this.id) {     // User already exists
        this.update(fn); 
    } else {
        var user = this;
        // create unique ID 
        db.incr('user:ids', function(err, id) { 
            if (err) return fn(err);
            // Set ID so it will be saved
            user.id = id;
            // Hash the password
            user.hashPassword(function(err) {
                if (err) return fn(err);
                // Save user properties
                user.update(fn);
            }); 
        });
    }
};

User.prototype.update = function(fn) {
    var user = this; 
    var id = user.id;
    db.set('user:id' + user.name, id, function(err) {
        if (err) return fn(err);
        // Use Redis hash to store data
        db.hmset('user:' + id, user, function(err) {
            fn(err);
        });
    });
};

// callback has two args
// first is for an error (if one occurs)
// second is for the results
User.prototype.hashPassword = function(fn) {
    var user = this;
    // Generate a 12-character salt
    bcrypt.genSalt(12, function(err,salt) {
        if (err) return fn(err);
        // Set salt to save it 
        user.salt = salt;
        bcrypt.hash(user.pass, salt, function(err, hash) {
            if (err) return fn(err);
            // Replace plain text password with hash 
            user.pass = hash;
            fn();
        });
    }); 
};

User.getByName = function(name, fn) {
    // Looks up the User ID by name
    User.getId(name, function(err, id) {
        if (err) return fn(err);
        User.get(id, fn);
    });
};

User.getId = function(name, fn) {
    // Get ID indexed by name
    db.get('user:id' + name, fn);  
};

User.get = function(id, fn) {
    // Fetch plain-object hash
    db.hgetall('user:' + id, function(err, user) {
        if (err) return fn(err);
        // convert plain object to a new User object
        // Return null as error and user as result 
        // I execute the callback I was passed 
        fn(null, new User(user));
    });
};

User.authenticate = function(name, pass, fn) {
    // Look up user by name
    User.getByName(name, function(err, user) {
        if (err) return fn(err); // the callback with error
        if (!user.id) return fn(); // User does not exist; invoke the callback
        // Hash the given password
        bcrypt.hash(pass, user.salt, function(err, hash) {
            if (err) return fn(err);
            if (hash == user.pass) return fn(null, user);  // match found
            fn(); // invalid password
        }); 
    }); 
};
