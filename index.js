//
// A server to control Garage Door using Raspberry Pi and PiFace.
//
process.title = "garage-control";

require('./lib/mqtt.js');

var doors = require('./doors.json');

require('./lib/door.control.js').init(doors);
