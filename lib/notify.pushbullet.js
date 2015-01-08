var EventBus = require('./EventBus');
var PushBullet = require('pushbullet');
if( process.env.PUSHBULLET ) {
    var pusher = new PushBullet(process.env.PUSHBULLET);
    
    EventBus.on('garage.door.openAlert', function(seconds) {
        //TODO make the time pretty, using minutes, hours, days
        pusher.note(undefined, 'Garage door alert', 'Door has not been closed for ' + Math.floor(seconds / 60) + ' minutes', function(error, response) {
            if( error ) {
                console.error('Failed to send notification to pushbullet');
            } else {
                console.info('Successfully sent notification to pushbullet');
            }
        });
    });

}