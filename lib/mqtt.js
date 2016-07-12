var EventBus = require('./EventBus');
var mqtt = require('mqtt');


exports.init = function(opts) {

    // Create a client connection
    var client = mqtt.connect(opts.broker, opts);
    
    client.on('connect', function() { // When connected
        console.info('MQTT: Successfully connected');
        // subscribe to a topic
        client.subscribe(opts.topic, function(error) {
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
        var words = message.toString().split(" ");
        if( topic == opts.topic && words.length > 2 && 
            words[0] == 'Operate' && words[1] == 'Garage' && words[2] > s-10000 && words[2] < s+10000 ) {
          EventBus.emit('garage.operate', function(error) {
              //TODO do something with error
          });
        }
    });

};