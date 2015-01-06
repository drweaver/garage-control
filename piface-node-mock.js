var EventBus = require('./EventBus');

exports.init = function() {
    console.info('initialising mock piface');
};

exports.digital_write = function(pin,state) {
    console.info('writing mock state '+ state +' to pin ' + pin);
    pins[pin] = state;
};

exports.digital_read = function(pin) {
    pins[pin];
};

var pins = [ 0, 0, 0, 0 ];

var pinActivated = pins.length;

setInterval(function() {
    if( pinActivated >= pins.length ) {
        pinActivated = 0;
    }
    if( pins[pinActivated] == 0 ) {
        pins[pinActivated] = 1;
        EventBus.emit('pfio.input.changed', pinActivated, 1);
    } else {
        pins[pinActivated] = 0;
        EventBus.emit('pfio.input.changed', pinActivated, 0);
        pinActivated++;
    }
} ,5000);