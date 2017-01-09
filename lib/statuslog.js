var EventBus = require('./EventBus');
var fs = require('fs')

exports.init = function(opts) {
    
    EventBus.on('garage.status.changed', function(lastState, newState) {
        fs.appendFile(opts.filename, Math.round(Date.now()/1000) + " " + newState.replace(/ /g, "_") + "\n", function(err) {
            if (err) console.error("Failed to append status to file: " + opts.filename + "\n" + err);
        });
    });
    
};