var EventBus = require('./EventBus');

if( process.argv.indexOf('--mock') != -1 ) {
    var pfio = require('./piface-node-mock');
    console.log('Mock mode');
} else {
    var pfio = require('piface-node');
    require('./pfio.input.changed.js');
}

var status = 'Opening or Closing';
var options = {};

function inputChanged(pin,state) {
  var lastStatus = status;
  if( pin == options.closed || pin == options.opened ) {
  	if( pin == options.opened )
  	    status = state ? 'Opened' : 'Closing';
  	if(pin == options.closed) 
  	    status = state ? 'Closed' : 'Opening';
  	if( lastStatus != status ) EventBus.emit('garage.status.changed', lastStatus, status);
  }
}

EventBus.on('pfio.input.changed', inputChanged);

EventBus.on('garage.status.request', function(response) {
   response(status); 
});

EventBus.on('garage.operate', function(response) {
    exports.operate(response);
});

/*-- Public functions --*/

exports.init = function(opts) {
    options = opts;
    if( options.relay === undefined ) throw new Error('Must supply value for relay');
    if( options.closed === undefined ) throw new Error('Must supply value for closed');
    if( options.opened === undefined ) throw new Error('Must supply value for opened');
    pfio.init();
    if( pfio.digital_read(options.closed) == 1 ) inputChanged( options.closed, 1 );
    if( pfio.digital_read(options.opened) == 1 ) inputChanged( options.opened, 1 );
}

exports.status = function() {
    return status;
}

exports.operate = function(finished) {
    console.info('operating door');
    pfio.digital_write(options.relay, 1);
    setTimeout(function() {
      pfio.digital_write(options.relay, 0);
      finished();
    }, 500);
}

//TODO Should we periodically check state directly from pins, don't depend soley on event?