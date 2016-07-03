var EventBus = require('./EventBus');
var PushBullet = require('pushbullet');
var async = require('async');
var DISMISSED = {
    dismissed: true
};

var pusher;
var LAST_MODIFIED_NULL = 9999999999;
var lastModified = LAST_MODIFIED_NULL;

var opts;


exports.init = function(options) {

    if (process.env.PUSHBULLET) {
        console.info('Pushbullet notifications enabled with key=' + process.env.PUSHBULLET);
        opts = options;
        pusher = new PushBullet(process.env.PUSHBULLET);
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
            console.log("event="+eventNum);
            dismissAll(function(){});
        });
        EventBus.on('garage.status.notify.open', function(seconds) {
            eventNum++;
            console.log("event="+eventNum);
            var thisEvent = eventNum;
            dismissAll(function() {
                setTimeout(function() { // de-bounce
                    console.log("before pusher.link thisEvent="+thisEvent+" eventNum="+eventNum);
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
                
                }, 1000);
            });
        });

        

   
        startStream();

        
    }
    else {
        console.error('Pushbullet Notifications NOT enabled, enable with PUSHBULLET=<your_key>');
    }

};

function startStream() {
    var stream = pusher.stream();
    stream.connect();
    stream.on('connect', function() {
        lastModified = LAST_MODIFIED_NULL;
        console.info('Successfully connected to PushBullet stream');
        pusher.history({limit:1}, function(error, response) {
            //TODO do something with error
            console.info('Last modified push: '+response.pushes[0].modified);
            lastModified = response.pushes[0].modified;
        });     
    });
    stream.on('close', function(error) {
        lastModified = LAST_MODIFIED_NULL;
        console.info('PushBullet stream closed');
    });
    stream.on('message', function(message) {
        //console.info('PushBullet message received: ');
        //console.log(message);
    });        
    stream.on('tickle', function(type) {
        console.info('PushBullet message received type='+type);
        if( type == 'push' ) {
            checkHistoryForOperateCommand(function (push) {
                //TODO Check push is within reasonable time
                EventBus.emit('garage.operate', function(error) {
                    if( error ) {
                        console.error('Failed to operate garage door');
                    } 
                });
            });
        }
    }); 
}

function checkHistoryForOperateCommand(callback) {
    pusher.history({limit:5, modified_after:lastModified}, function(error, response) {
       //TODO deal with error
       for (var i in response.pushes) {
           var msg = response.pushes[i];
           if( i==0 ) lastModified = msg.modified;
           console.log('History push: ' + msg.type + ' ' + msg.body);
           if( msg.type == 'note' && msg.body == opts.command) {
               callback(msg);
               break;
           }
       }
    });
}