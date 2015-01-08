var http = require('http');
var path = require('path');

var socketio = require('socket.io');
var express = require('express');

var EventBus = require('./EventBus');

var door = require('./door.control.js');
var pos = require('./auth.pos.js');

var router = express();
var server = http.createServer(router);
var io = socketio.listen(server, { 'resource': '/gc/socket.io'});

router.use(express.static( path.resolve(__dirname, '../client')));

io.on('connection', function (socket) {
  
    socket.emit('status', door.status());

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
  io.sockets.emit('status', newState);
  console.log('Garage Door status changed from ' + lastState + ' to ' + newState);
});

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Garage server listening at", addr.address + ":" + addr.port);
});
