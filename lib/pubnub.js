var PubNub = require('pubnub');
var eventbus = require('./EventBus.js');
var config = require('../etc/pubnub.json');

var channel = 'garagecontrol.request';

var pubnub = new PubNub({
    subscribeKey: config.subscribeKey,
    publishKey: config.publishKey,
    ssl: true,
    uuid: config.uuid || PubNub.generateUUID()
});

/* Emit temperature when message received */
pubnub.addListener({
    message: function(m) {
        var msg = m.message; // The Payload
        console.log("PUBNUB: New Message on channel "+m.channel);
        if( msg.event ) {

            if( msg.event == 'garage.operate' || msg.event == 'garage.open' || msg.event == 'garage.close') {
                eventbus.emit(msg.event, function(error) {
                    if(error) console.log('Failed to operate garage: '+error);
                });
            } else if( msg.event == 'garage.delay.event.enable') {
                eventbus.emit(msg.event);
            } else if (msg.event == 'garage.delay.event.trigger') {
                eventbus.emit(msg.event);
            } else {
                console.log('PUBNUB: message ignored: ' + msg.event);
            }
            
        }        
    },
    status: function(s) {
        if (s.category === "PNConnectedCategory") {
                console.log("PUBNUB: Successfully connected");
        }
    }
});

pubnub.subscribe({
    channels: [channel],
    withPresence: false 
});