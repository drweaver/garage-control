var EventBus = require('./EventBus');

var options = {};

/*-- Public functions --*/

exports.init = function(opts) {
    options = opts;
    
    var triggerOpen = function() {
        disable();
        EventBus.emit('garage.open', function(err) {
            if(err) console.log('Failed to open garage: ' + err);
        });
    };
    
    var disable = function() {
        EventBus.removeListener('garage.delay.event.trigger', triggerOpen);
        console.info("garage.delay.event disabled");
    };
    
    var enable = function() {
        EventBus.on('garage.delay.event.trigger', triggerOpen);  
        console.info("garage.delay.event enabled");
    };
    
    var cancelTimeout = function() { //NOOP 
    };

    EventBus.on('garage.delay.event.enable', function() {
        
        cancelTimeout();
        
        enable();
        
        var timer = setTimeout(function() {
            disable();
        }, options.timeout * 60 * 1000);
        
        cancelTimeout = function() {
            clearTimeout(timer);
        };
        
    });
};
 