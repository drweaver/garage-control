var EventBus = require('./EventBus');
// Access the callback-based API
var amqp = require('amqplib/callback_api');
var amqpConn = null;
var url = null;
var q = null;

exports.init = function(opts) {
    url = opts.url;
    q = opts.queue;

    start();
};

function whenConnected() {
    consumer();
};

// A worker that acks messages only if processed successfully
function consumer(conn) {
  var ok = amqpConn.createChannel(on_open);
  function on_open(err, ch) {
    if (err != null) {
        console.error("[AMQP] failed to create channel: " + err);
        return;
    };
    ch.assertQueue(q);
    ch.consume(q, function(msg) {
      if (msg !== null) {
        ch.ack(msg);
        var message = msg.content.toString();
        
        
        var s = new Date().getTime();
        console.log("Received '" + message );
        console.log("Current time = " + s);
        try {
            var msg = JSON.parse(message);
            if( msg.event ) {

                if( msg.event == 'garage.operate' || msg.event == 'garage.open' || msg.event == 'garage.close') {
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
        
      }
    });
  }
}


function start() {
  amqp.connect(url + "?heartbeat=60", function(err, conn) {
    if (err) {
      console.error("[AMQP]", err.message);
      return setTimeout(start, 1000);
    }
    conn.on("error", function(err) {
      if (err.message !== "Connection closing") {
        console.error("[AMQP] conn error", err.message);
      }
    });
    conn.on("close", function() {
      console.error("[AMQP] reconnecting");
      return setTimeout(start, 1000);
    });
    console.log("[AMQP] connected");
    amqpConn = conn;
    whenConnected();
  });
}