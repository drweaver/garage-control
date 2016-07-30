var http = require('http');
var path = require('path');
var httpProxy = require('http-proxy');

var socketio = require('socket.io');
var express = require('express');

var EventBus = require('./EventBus');

var pos = require('./auth.pos.js');

var router = express();
router.use(express.compress());
var server = http.createServer(router);
var io = socketio.listen(server, {'path': '/gc/socket.io'});

router.use(express.static( path.resolve(__dirname, '../client'), {maxAge: 2419200000}));

exports.init = function(opts) {

  var proxy = httpProxy.createProxyServer(opts.cam);
  router.get('/gc/cam', function(req, res) {
    proxy.web(req, res );
  });
  return exports;
  
};


io.on('connection', function (socket) {

  socket.posauthorised = false;
  
  EventBus.emit('garage.status.request', function(status) {
    socket.emit('status', status);
  });
  
  socket.on('position', function(latlng, fn) {
    socket.posauthorised = pos.authorised(latlng);
    fn( socket.posauthorised );
  });

  socket.on('operate', function(fn) {
    if( socket.posauthorised ) {
      EventBus.emit('garage.operate', function(error) {
        if( error ) {
          console.error('Failed to operate garage door');
          fn('error', 'Failed to operate garage door');
        } else {
          fn('success', 'Door operated successfully');
        }
      });
    } else {
        fn('error', 'Not close enough to operate door');
    } 
  });

});

EventBus.on('garage.status.changed', function(lastState, newState) {
  io.sockets.emit('status', newState);
  console.log('Garage Door status changed from ' + lastState + ' to ' + newState);
}); 

exports.start = function() {
  server.listen(process.env.PORT || 5100, process.env.IP || "0.0.0.0", function(){
    var addr = server.address();
    console.log("Garage server listening at", addr.address + ":" + addr.port);
  });
}
