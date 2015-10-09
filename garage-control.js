//
// A server using Socket.IO and Express to control Garage Door using Raspberry Pi and PiFace.
//
require('./lib/notify.pushbullet.js');  // Set with EXPORT PUSHBULLET=<your api key>

require('./lib/door.monitor.js');

require('./lib/door.control.js').init({ relay: 0, opened: 1, closed: 0 });

require('./lib/auth.pos.js').init({ distance: 3 }); // Set Lat,Lng with EXPORT LATLNG=<lat>,<lng> or in init({ distance: 3, lat: <lat>, lng: <lng>})

require('./lib/server.js');
