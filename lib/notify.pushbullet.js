var EventBus = require('./EventBus');
var PushBullet = require('pushbullet');
var async = require('async');
var DISMISSED = {
    dismissed: true
};

exports.init = function(opts) {

    if (process.env.PUSHBULLET) {
        console.info('Pushbullet notifications enabled with key=' + process.env.PUSHBULLET);
        var pusher = new PushBullet(process.env.PUSHBULLET);
        var notifications = [];
        var eventNum = 0;
        var dismissPush = function(push, done) {
            if (push.dismissed == false) {
                pusher.updatePush(push.iden, DISMISSED, function(error, response) {
                    if (error) {
                        console.error('Failed to dismissed pushbullet notification iden=' + push.iden);
                        done('Failed to dismiss pushbullet notification id=' + push.iden + ': ' + error);
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
        var dismissAll = function(done) {
            if( notifications.length == 0 ) {
                return done();
            }
            var to_dismiss = notifications;
            notifications = []; // to avoid re-entry executing
            async.eachSeries(to_dismiss, dismissPush, function(err) {
               if(err) {
                   console.error("Failed to dismiss all notifications");
                   notifications = notifications.concat(to_dismiss);
               } 
               done();
            });
        };
        EventBus.on('garage.status.notify.closed', function() {
            eventNum++;
            dismissAll(function(){});
        });
        EventBus.on('garage.status.notify.open', function(seconds) {
            eventNum++;
            var thisEvent = eventNum;
            dismissAll(function() {
                if( thisEvent != eventNum ) { // we had a new event by time we dismissed notifications
                    console.info("No need to fire open notification, thisEvent="+thisEvent+" eventNum="+eventNum);
                    return;
                }
                
                pusher.link(undefined, 'Garage Open' + (seconds < 60 ? 'ed just now' : ' for ' + Math.floor(seconds / 60) + ' mins'), opts.link, function(error, response) {
                    if (error) {
                        console.error('Failed to send notification to pushbullet');
                    }
                    else {
                        console.info('Successfully sent notification to pushbullet iden=' + response.iden);
                        if( thisEvent != eventNum ) {
                            console.info("Dismissing notification, thisEvent="+thisEvent+" eventNum="+eventNum);
                            dismissPush(response, function(err) {
                               if(err) {
                                   notifications.push(response);
                               } 
                            });
                            return;
                        }
                        notifications.push(response);
                    }
                });
            });
        });
    }
    else {
        console.error('Pushbullet Notifications NOT enabled, enable with PUSHBULLET=<your_key>');
    }

};