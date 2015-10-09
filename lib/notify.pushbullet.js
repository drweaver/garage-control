var EventBus = require('./EventBus');
var PushBullet = require('pushbullet');
var DISMISSED = {
    dismissed: true
};
if (process.env.PUSHBULLET) {
    console.info('Pushbullet notifications enabled with key='+process.env.PUSHBULLET);
    var pusher = new PushBullet(process.env.PUSHBULLET);
    console.log("Pushbullet Notifier enabled");
    var lastPush;
    EventBus.on('garage.status.openAlert', function(seconds) {

        if (lastPush !== undefined) {
            pusher.updatePush(lastPush, DISMISSED, function(error, response) {
                if (error) {
                    console.error('Failed to dismiss last pushbullet notification');
                }
                else {
                    console.info('Successfully dismissed last pushbullet notification iden=' + lastPush);
                }
            });
        }

        //TODO make the time pretty, using minutes, hours, days
        pusher.note(undefined, 'Garage door alert', 'Door has not been closed for ' + Math.floor(seconds / 60) + ' minutes', function(error, response) {
            if (error) {
                console.error('Failed to send notification to pushbullet');
            }
            else {
                console.info('Successfully sent notification to pushbullet iden=' + response.iden);

                lastPush = response.iden;
            }
        });
    });
} else {
   console.error('Pushbullet Notifications NOT enabled, enable with PUSHBULLET=<your_key>');
}

