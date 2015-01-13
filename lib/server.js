var http = require('http');
var path = require('path');

var socketio = require('socket.io');
var express = require('express');

var EventBus = require('./EventBus');

var pos = require('./auth.pos.js');

var router = express();
var server = http.createServer(router);
var io = socketio.listen(server, { 'resource': '/gc/socket.io'});

router.use(express.static( path.resolve(__dirname, '../client')));

io.on('connection', function (socket) {
  
  EventBus.emit('garage.status.request', function(status) {
    socket.emit('status', status);
  });
  
  socket.on('position', function(latlng, fn) {
    fn( pos.authorised(latlng) );
  });

  socket.on('operate', function(latlng, fn) {
    if( pos.authorised(latlng) ) {
      EventBus.emit('garage.operate', function(error) {
        if( error ) {
          console.error('Failed to operate garage door');
          fn('Failed to operate garage door');
        } else {
          fn('Door operated successfully');
        }
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

server.listen(process.env.PORT || 5100, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Garage server listening at", addr.address + ":" + addr.port);
});
