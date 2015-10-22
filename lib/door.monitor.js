var EventBus = require('./EventBus');

var lastClosed = new Date().getTime();

var options = {};



/*-- Public functions --*/

exports.init = function(opts) {
    options = opts;
    setInterval(function() {
        console.log('Checking door status');
        EventBus.emit('garage.status.request', function(status) {
            if (status === 'Closed') {
                console.log('Already in closed state');
                return;
            }
            var diff = Math.floor((new Date().getTime() - lastClosed) / 1000);
            console.log('last closed ' + diff + 's ago, openAlert limit=' + options.openAlert);
            if (diff > options.openAlert) {
                EventBus.emit('garage.status.notify.open', diff);
            }
        });
    }, options.interval * 1000);

    EventBus.on('garage.status.changed', function(lastState, newState) {
        if (newState == 'Closed') {
            lastClosed = 0;
            EventBus.emit('garage.status.notify.closed');
        }
        if (lastState == 'Closed') {
            lastClosed = new Date().getTime();
            EventBus.emit('garage.status.notify.open', 0);
        }
    });
}