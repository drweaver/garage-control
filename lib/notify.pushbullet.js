var EventBus = require('./EventBus');
var PushBullet = require('pushbullet');
var DISMISSED = {
    dismissed: true
};
if (process.env.PUSHBULLET) {
    console.info('Pushbullet notifications enabled with key='+process.env.PUSHBULLET);
    var pusher = new PushBullet(process.env.PUSHBULLET);
    console.log("Pushbullet Notifier enabled");
    var lastOpenPush = DISMISSED;
    var dismissPush = function(push, done) {
        if (push.dismissed == false) {
            pusher.updatePush(push.iden, DISMISSED, function(error, response) {
                if (error) {
                    console.error('Failed to dismissed pushbullet notification iden=' + push.iden);
                    done('Failed to dismiss pushbullet notification id='+push.iden+': '+error);
                }
                else {
                    console.info('Successfully dismissed pushbullet notification iden=' + push.iden);
                    push.dismissed = true;
                    done();
                }
            });
        } else {
            done();
        }
    };
    EventBus.on('garage.status.notify.closed', function() {
       dismissPush(lastOpenPush, function(){}); 
    });
    EventBus.on('garage.status.notify.open', function(seconds) {
        dismissPush(lastOpenPush, function() {
            pusher.link(undefined, 'Garage Open' +(seconds==0?'ed just now':' for '+Math.floor(seconds / 60)+' mins'), 'https://node-garage-control-drweaver1.c9.io', function(error, response) {
                if (error) {
                    console.error('Failed to send notification to pushbullet');
                } else {
                    console.info('Successfully sent notification to pushbullet iden=' + response.iden);
                    lastOpenPush = response;
                }                
            })
        });
    });
} else {
   console.error('Pushbullet Notifications NOT enabled, enable with PUSHBULLET=<your_key>');
}

