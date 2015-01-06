//
// # SimpleServer
//
// A simple server using Socket.IO and Express to control Garage Door using Raspberry Pi and PiFace.
//
var http = require('http');
var path = require('path');

var socketio = require('socket.io');
var express = require('express');

var EventBus = require('./EventBus');

var door = require('./door.js');
var pos = require('./pos.js');
require('./doormonitor.js');

door.init( { relay: 0, opened: 1, closed: 2 } );

var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

router.use(express.static(path.resolve(__dirname, 'client')));
var sockets = [];

io.on('connection', function (socket) {
  
    sockets.push(socket);
    
    socket.emit('status', door.status());

    socket.on('disconnect', function () {
      sockets.splice(sockets.indexOf(socket), 1);
    });
    
    socket.on('position', function(latlng, fn) {
      fn( pos.authorised(latlng) );
    });

    socket.on('operate', function(latlng, fn) {
      if( pos.authorised(latlng) ) {
        door.operate(function() {
          fn('Door operated successfully');
        });
      } else {
          fn('Not close enough to operate door');
      } 
    });

  });

EventBus.on('garage.status.changed', function(lastState, newState) {
  sockets.forEach(function (socket) {
    socket.emit('status', newState);
  });
  console.log('Garage Door status changed from ' + lastState + ' to ' + newState);
});

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Garage server listening at", addr.address + ":" + addr.port);
});
