//
// A server using Socket.IO and Express to control Garage Door using Raspberry Pi and PiFace.
//

var config = require('./config.json');

require('./lib/notify.pushbullet.js').init(config.pushbullet);  // Set with EXPORT PUSHBULLET=<your api key>

require('./lib/delay.event.js').init(config.delay);

require('./lib/door.monitor.js').init(config.notify);

require('./lib/door.control.js').init(config.pfio);

require('./lib/amqp.js').init(config.amqp);

require('./lib/auth.pos.js').init(config.pos); // Set Lat,Lng with EXPORT LATLNG=<lat>,<lng> or in init({ distance: 3, lat: <lat>, lng: <lng>})

require('./lib/server.js').init(config.server).start();
