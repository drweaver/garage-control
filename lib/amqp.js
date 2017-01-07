var EventBus = require('./EventBus');
// Access the callback-based API
var amqp = require('amqplib/callback_api');
var amqpConn = null;
var url = null;
var q = null;
var exchange = null;

exports.init = function(opts) {
    url = opts.url;
    q = opts.queue;
    exchange = opts.exchange;

    start();
};

function whenConnected() {
    consumer();
    publisher();
}

// Publisher 
function publisher() {
  
    amqpConn.createChannel(on_open);
    function on_open(err, ch) {
      if (err != null) {
          console.error("[AMQP] failed to create channel: " + err);
          return;
      }
      ch.assertExchange(exchange, 'fanout');
      
      EventBus.emit('garage.status.request', function(status) {
          var res = { event: 'garage.status', state: status };
          console.log('publishing message to MQ: '+JSON.stringify(res));
          ch.publish(exchange, '', new Buffer(JSON.stringify(res)));
      });
      
      
      EventBus.on('garage.status.changed', function(lastState, newState) {
        var msg = { event: 'garage.status', state: newState };
        console.log('publishing message to MQ: '+JSON.stringify(msg));
        ch.publish(exchange, '', new Buffer(JSON.stringify(msg)));
    });
  }
}

// A worker that acks messages only if processed successfully
function consumer() {
  amqpConn.createChannel(on_open);
  function on_open(err, ch) {
    if (err != null) {
        console.error("[AMQP] failed to create channel: " + err);
        return;
    }
    ch.assertQueue(q);
    ch.consume(q, function(msg_raw) {
      if (msg_raw !== null) {
        ch.ack(msg_raw);
        var message = msg_raw.content.toString();
        
        
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
                    console.log('MQ message ignored: ' + msg.event);
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