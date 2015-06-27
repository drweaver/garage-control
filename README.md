

Node.js implementation of Garage server and client.

This uses `socket.io` with a static `express` server.

## Running the server

1) On Cloud9 and using mocked mode (see below) open `server.js` and start the app by clicking on the "Run" button in the top menu.

2) Alternatively launch the app from the Terminal:

    $ node server.js

## Mocked piface mode

Replace

    $ var pfio = require('./piface-node');
With

    $ var pfio = require('./piface-node-mock');
    
##TODO

* GZIP http responses, see http://blog.modulus.io/nodejs-and-express-static-content
