var EventBus = require('./EventBus');
var mqtt = require('mqtt');
var config = require('../etc/mqtt.json');

const WILL = { topic: config.topic, payload: 'unknown', retain: true, qos: 0 };

// Create a client connection
var client = mqtt.connect(config.url, { will: WILL });

client.on('connect', function() { // When connected
    console.info('MQTT: Successfully connected');
    // subscribe to a topic
    client.subscribe(config.topic+'/set');

});

client.on('close', function() {
   console.info('MQTT: Connection closed');
});

// when a message arrives, do something with it
client.on('message', function(topic, message, packet) {
    if( packet.retain ) {
      console.info('Ignoring stale message: '+topic+' '+message);
      return;
    }
    if( message == 'open' || message == 'close' || message == 'operate' ) {
        EventBus.emit('garage.'+message, function(error) {
            if(error) console.log('Failed to operate garage: '+error);
        });
    } 
});

EventBus.on('garage.status.changed', function(lastState, newState) {
    var msg = { event: 'garage.status.changed',
                lastState: lastState,
                newState: newState };
    console.log('publishing message to MQTT: '+JSON.stringify(msg));
    client.publish(config.topic, newState.toLowerCase(), { retain:true });
}); 

