//
// A server using Socket.IO and Express to control Garage Door using Raspberry Pi and PiFace.
//
process.title = "garagecontrol";

require('./lib/mqtt.js');

require('./lib/door.control.js').init({
        "relay": 0,
        "opened": 1,
        "closed": 0
    });

