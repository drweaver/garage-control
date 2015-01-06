var EventBus = require('./EventBus');

var pfio = require('./piface-node-mock');

var status = 'Opening or Closing';
var options = {};

EventBus.on('pfio.input.changed', inputChanged);

function inputChanged(pin,state) {
  var lastStatus = status;
  if( pin == options.closed || pin == options.opened ) {
  	if( pin == options.opened ) {
  	  if( state === 0 )  status = 'Closing';
  	  else               status = 'Opened';
  	} 
  	if(pin == options.closed) {
  	  if( state === 0 )  status = 'Opening';
  	  else               status = 'Closed';
  	}
  	if( lastStatus != status ) EventBus.emit('garage.status.changed', lastStatus, status);
  }
}

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
    }, 1000);
}