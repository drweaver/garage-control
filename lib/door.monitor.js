var EventBus = require('./EventBus');

var lastClosed = new Date().getTime();

//TODO provide init options for these
var interval = 10 * 60;
var openAlert = 15 * 60;

setInterval( function() {
    console.log('Checking door status');
    if( lastClosed === 0 ) {
        console.log('Already in closed state');
        return;
    }
    var diff = ( new Date().getTime() - lastClosed) / 1000;
    console.log('last closed ' + diff + 'mins ago');
    if( diff > openAlert ) {
        EventBus.emit('garage.door.openAlert', diff);
    }
  }
  , interval * 1000);
  
EventBus.on('garage.status.changed', function(lastState, newState) {
    if( newState == 'Closed' ) {
        lastClosed = 0;
        return;
    }
  	if( lastState == 'Closed' ) {
  	    lastClosed = new Date().getTime();
  	}
});
