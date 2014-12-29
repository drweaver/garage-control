//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');

var socketio = require('socket.io');
var express = require('express');

var EventBus = require('./EventBus');
var pfio = require('./piface-node-mock');

pfio.init();

//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

router.use(express.static(path.resolve(__dirname, 'client')));
var messages = [];
var sockets = [];
var status = 'Opening or Closing';
var statusOptions = ['Closed', 'Opening', 'Opened', 'Closing'];
var statusCount = 0;

var relayChannel = 0;
var openedChannel = 1;
var closedChannel = 2;

if( pfio.digital_read(closedChannel) == 1 ) {
  status = 'Closed';
}
if( pfio.digital_read(openedChannel) == 1 ) {
  status = 'Opened';
}

io.on('connection', function (socket) {
    messages.forEach(function (data) {
      socket.emit('message', data);
    });

    sockets.push(socket);
    
    socket.emit('status', status);

    socket.on('disconnect', function () {
      sockets.splice(sockets.indexOf(socket), 1);
    });

    socket.on('operate', function(pos, fn) {
      console.info('operating door');
      //TODO: check distance
      pfio.digital_write(0,1);
      setTimeout(function() {
        pfio.digital_write(0,0);
        fn('Door operated successfully');
      }, 1000);
      console.info('lat = '+pos.lat);
      console.info('lng = '+pos.lng);
      /*
      setTimeout(function() {
        statusCount++;
        status = statusOptions[statusCount % statusOptions.length];
        broadcast('status', status);
      }, 2000);
      */
    });

  });


EventBus.on('pfio.input.changed', function(pin, state) {
	if( pin == openedChannel ) {
	  if( state === 0 ) {
	    status = 'Closing';
	  } else {
	    status = 'Opened';
	  }
	  broadcastStatus();
	} else if(pin == closedChannel) {
	  if( state === 0 ) {
	    status = 'Opening';
	  } else {
	    status = 'Closed';
	  }
	  broadcastStatus();
	}
});

function broadcastStatus() {
  broadcast('status', status);
}

function broadcast(event, data) {
  console.info('Broadcasting ' + event + ' ' + data);
  sockets.forEach(function (socket) {
    socket.emit(event, data);
  });
}

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
