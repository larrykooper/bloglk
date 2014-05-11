var redis = require('redis');
// instantiate Redis client
//var db = redis.createClient();
var db = redis.createClient('6379', process.env.REDIS_IP);

// Export Entry function from the module
module.exports = Entry;

// Iterate keys in the object passed 
function Entry(obj) {
    for (var key in obj) {
        // merge values 
        this[key] = obj[key];
    }
}

Entry.prototype.save = function(fn) {
    // Convert saved entry data to JSON string
    var entryJSON = JSON.stringify(this);

// Save JSON string to Redis list    
    db.lpush(
        'entries',
        entryJSON,
        function(err) {
            if (err) return fn(err);
            fn();
        }
    );    
};

Entry.getRange = function(from, to, fn) {
    // Redis lrange function is used to retrieve entries
    db.lrange('entries', from, to, function(err, items) {
        if (err) return fn(err);
        var entries = [];
        
        // Decode entries previously stored as JSON
        items.forEach(function(item) {
            entries.push(JSON.parse(item));
        });
        fn(null, entries);
    });    
};