var EventBus = require('./EventBus');
var mqtt = require('mqtt');

var topicBase = "home/garage/";

const WILL = { topic: topicBase + 'status', payload: 'Disconnected', retain: true, qos: 0 };
var url = process.env.MQTT_URL;
var opts = { username: process.env.MQTT_USERNAME, password: process.env.MQTT_PASSWORD, will: WILL };

// Create a client connection
var client = mqtt.connect(url, opts);

client.on('connect', function() { // When connected
    console.info('MQTT: Successfully connected');
    client.publish(topicBase + 'status', 'OK', {retain:true});
    // subscribe to operate topic
    client.subscribe(topicBase+'operate');
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
    EventBus.emit('garage.operate', message, function(error) {
        if(error) console.log('Failed to operate garage: '+error);
    });
});

EventBus.on('garage.status.changed', function(door, lastState, newState) {
    client.publish(topicBase + door, newState.toLowerCase(), { retain:true });
}); 

