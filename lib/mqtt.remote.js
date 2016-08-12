var EventBus = require('./EventBus');
var mqtt = require('mqtt');


exports.init = function(opts) {
    
    // Cache state
    var currentState = 'Opening or Closing';

    // Create a client connection
    var client = mqtt.connect(opts.broker, opts);
    
    var garageStatusRequest = JSON.stringify({ event: 'garage.status.request' });

    client.on('connect', function() { // When connected
        console.info('MQTT: Successfully connected');
        // subscribe to a topic
        client.subscribe(opts.topic, function(error) {
        //TODO deal with error
        
        });
        
        // get current state
        client.publish(opts.topic, garageStatusRequest);
    
    });
    
    client.on('close', function() {
       console.info('MQTT: Connection closed') 
    });

    // when a message arrives, do something with it
    client.on('message', function(topic, message, packet) {
        try {
            var msg = JSON.parse(message);
            if( msg.event ) {
                if( msg.event == 'garage.status.changed' ) {
                    currentState = msg.newState;
                    EventBus.emit('garage.status.changed', msg.lastState, msg.newState);
                }
                if( msg.event == 'garage.status') {
                    if( currentState != msg.state ) {
                        EventBus.emit('garage.status.changed', currentState, msg.state);
                    }
                    currentState = msg.state;
                    
                }
            }
        } catch( err ) {
            console.error("Failed to parse message as JSON: "+message);
        }
    });
    
    EventBus.on('garage.status.request', function(callback) {
        callback(currentState);
        // Lets fire off a request too
        client.publish(opts.topic, garageStatusRequest);
    });

    EventBus.on('garage.operate', function(callback) {
        
        var garageOperate = JSON.stringify({ event: "garage.operate", time: new Date().getTime() });
        client.publish(opts.topic, garageOperate);
        callback();
        
    });

};