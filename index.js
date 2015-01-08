require('./lib/notify.pushbullet.js');  // Set with EXPORT PUSHBULLET=<your api key>

require('./lib/door.control.js').init({ relay: 0, opened: 0, closed: 1 });

require('./lib/door.monitor.js');

require('./lib/server.js');