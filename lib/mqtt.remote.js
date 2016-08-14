var EventBus = require('./EventBus');
var mqtt = require('mqtt');


exports.init = function(opts) {

    var UNKNOWN_STATE = 'Opening or Closing';
    
    // Cache state
    var currentState = UNKNOWN_STATE;

    // Create a client connection
    var client = mqtt.connect(opts.broker, opts);
    
    var garageStatusRequest = JSON.stringify({ event: 'garage.status.request' });

    client.on('connect', function() { // When connected
        console.info('MQTT: Successfully connected');
        // subscribe to a topic
        client.subscribe(opts.topic_remote, function(error) {
        //TODO deal with error
        
        });
        
        // get current state
        console.log('publishing message to MQTT: '+garageStatusRequest);
        client.publish(opts.topic_local, garageStatusRequest);
    
    });
    
    client.on('close', function() {
       console.info('MQTT: Connection closed');
       if( currentState != UNKNOWN_STATE ) {
            EventBus.emit('garate.status.changed', currentState, UNKNOWN_STATE);
            currentState = UNKNOWN_STATE;
       }
    });

    // when a message arrives, do something with it
    client.on('message', function(topic, message, packet) {
        console.log("Received '" + message + "' on '" + topic + "'");
        try {
            var msg = JSON.parse(message);
            if( msg.event ) {
                if( msg.event == 'garage.status.changed' ) {
                    currentState = msg.newState;
                    EventBus.emit('garage.status.changed', msg.lastState, msg.newState);
                }
                else if( msg.event == 'garage.status') {
                    if( currentState != msg.state ) {
                        EventBus.emit('garage.status.changed', currentState, msg.state);
                    }
                    currentState = msg.state;
                    
                } else {
                    console.log("MQTT message ignored");
                }
            }
        } catch( err ) {
            console.error("Failed to parse message as JSON: "+message);
        }
    });
    
    EventBus.on('garage.status.request', function(callback) {
        callback(currentState);
        // Lets fire off a request too
        console.log('publishing message to MQTT: '+garageStatusRequest);
        client.publish(opts.topic_local, garageStatusRequest);
    });

    EventBus.on('garage.operate', function(callback) {
        
        var garageOperate = JSON.stringify({ event: "garage.operate", time: new Date().getTime() });
        console.log('publishing message to MQTT: '+garageOperate);
        client.publish(opts.topic_local, garageOperate);
        callback();
        
    });

};