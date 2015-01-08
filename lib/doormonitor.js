var EventBus = require('./EventBus');

var lastClosed = new Date().getTime();

var intervalMins = 10;
var openAlertMins = 15;

setInterval( function() {
    console.log('Checking door status');
    if( lastClosed === 0 ) {
        console.log('Already in closed state');
        return;
    }
    var diffMins = ( new Date().getTime() - lastClosed) / 60000;
    console.log('last closed ' + diffMins + 'mins ago');
    if( diffMins > openAlertMins ) {
        EventBus.emit('garage.door.openAlert', diffMins);
    }
  }
  , intervalMins * 60000);
  
EventBus.on('garage.status.changed', function(lastState, newState) {
    if( newState == 'Closed' ) {
        lastClosed = 0;
        return;
    }
  	if( lastState == 'Closed' ) {
  	    lastClosed = new Date().getTime();
  	}
});
