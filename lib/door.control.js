var EventBus = require('./EventBus');
var pfio = require('piface');
require('./pfio.input.changed.js');
var _ = require('underscore');

var doors = {};

function inputChanged(pin,state) {
    var door = _.find(_.values(doors), (d)=>{return d.closed_pin == pin});
    if( _.isUndefined(door) ) {
        console.info('inputChanged but pin not being tracked by any door: ' + pin);
        return;
    }
    var lastStatus = door.status;
    door.status = state ? 'Closed' : 'Open';
  	if( lastStatus != door.status ) EventBus.emit('garage.status.changed', door.name, lastStatus, door.status);
}

EventBus.on('pfio.input.changed', inputChanged);

EventBus.on('garage.operate', function(name, finished) {
    console.info('operating door: ' + name);
    if( !_.has( doors, name) ) {
        console.info('Door doesn\'t exist!');
        finished();
        return;
    }
    if( !_.has( doors[name], 'relay_pin') ) {
        console.info('Door doesn\'t have relay_pin defined, unable to operate');
        finished();
        return;
    }
    pfio.digital_write(doors[name].relay_pin, 1);
    setTimeout(function() {
      pfio.digital_write(doors[name].relay_pin, 0);
      finished();
    }, 500);
});

function checkDoors() {
    _.each(_.values(doors), d=>{inputChanged(d.closed_pin, pfio.digital_read(d.closed_pin))});
    setTimeout( checkDoors, 3600000 );
}

/*-- Public functions --*/

exports.init = function(d) {
    doors = d;
    pfio.init();
    _.each(doors, (opts, door)=>{
        if( !_.has(opts, 'closed_pin') 
        || !_.isNumber(opts.closed_pin) 
        || opts.closed_pin < 0 || opts.closed_pin > 7 ) 
            throw new Error('Door options must contain a closed_pin value between 0 and 7');

        if( _.has(opts, 'relay_pin') && ( opts.relay_pin < 0 || opts.relay_pin > 1 ) )
            throw new Error('Door options relay_pin must be 0 or 1');

        opts.status = 'unknown';
        opts.name = door;
    });
    checkDoors();
}


