var EventBus = require('./EventBus');
var mqtt = require('mqtt');


exports.init = function(opts) {

    // Create a client connection
    var client = mqtt.connect(opts.broker, opts);
    
    client.on('connect', function() { // When connected
        console.info('MQTT: Successfully connected');
        // subscribe to a topic
        client.subscribe(opts.topic_local, function(error) {
        //TODO deal with error
        
        });
    
    });
    
    client.on('close', function() {
       console.info('MQTT: Connection closed') 
    });

    // when a message arrives, do something with it
    client.on('message', function(topic, message, packet) {
        var s = new Date().getTime();
        console.log("Received '" + message + "' on '" + topic + "'");
        console.log("Current time = " + s);
        try {
            var msg = JSON.parse(message);
            if( msg.event ) {
                if( msg.event == 'garage.status.request' ) {
                      EventBus.emit('garage.status.request', function(status) {
                        var res = { event: 'garage.status', state: status };
                        console.log('publishing message to MQTT: '+JSON.stringify(res));
                        client.publish(opts.topic_remote, JSON.stringify(res));
                    });
                }
                else if( msg.event == 'garage.operate' || msg.event == 'garage.open' || msg.event == 'garage.close') {
                    EventBus.emit(msg.event, function(error) {
                        if(error) console.log('Failed to operate garage: '+error);
                    });
                } else if( msg.event == 'garage.delay.event.enable') {
                    EventBus.emit(msg.event);
                } else if (msg.event == 'garage.delay.event.trigger') {
                    EventBus.emit(msg.event);
                } else {
                    console.log('MQTT message ignored');
                }
                
            }
        } catch( err ) {
            console.error("Failed to parse message as JSON: "+message);
        }
    });
    
    EventBus.on('garage.status.changed', function(lastState, newState) {
        var msg = { event: 'garage.status.changed',
                    lastState: lastState,
                    newState: newState };
        console.log('publishing message to MQTT: '+JSON.stringify(msg));
        client.publish(opts.topic_remote, JSON.stringify(msg));
    }); 
    

};