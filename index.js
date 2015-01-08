require('./lib/door.js').init({ relay: 0, opened: 0, closed: 1 });

require('./lib/doormonitor.js');

require('./lib/server.js');