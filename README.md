

Node.js implementation of Garage server and client.  Uses [PiFace Digital](http://www.piface.org.uk/products/piface_digital/) module for sensors and relay.

This uses `socket.io` with a static `express` server.

## Config

Create a config.json file in the root folder with the following format:

```
{ 
    "notify": {
        "interval": 20,
        "openAlert": 30
    }
}
```

## Running the server

1) On Cloud9 and using mocked mode (see below) open `server.js` and start the app by clicking on the "Run" button in the top menu.

2) Alternatively launch the app in mocked mode from the Terminal:

```
$ node server.js --mock
```
## Production mode

Just remove the `mock` argument:
```
$ PUSHBULLET=[your key] node server.js 
```

## Webcam Integration

* Install mjpeg_streamer
* Add the following to crontab:
```
@reboot /usr/bin/nohup /usr/local/bin/mjpg_streamer -i "/usr/local/lib/input_uvc.so -n -f 2 -r 640x480"  -o "/usr/local/lib/output_http.so -p 10088 -w /home/[user]/www" >> /home/[user]/logs/mjpeg_streamer.log
```

##FAQs

* PiFace isn't working
  * Check to ensure you've [enabled SPI module](http://www.piface.org.uk/guides/Install_PiFace_Software/Enabling_SPI/)

* How do I get it working on bootup
  * If installed under normal user account add following to crontab:
```
PUSHBULLET=[private key]
@reboot /usr/bin/nohup /opt/node/bin/node /home/[username]/garage-control/garage-control.js > /home/[username]/logs/garage-control.log &
```

##TODO

* [DONE] GZIP http responses, see http://blog.modulus.io/nodejs-and-express-static-content
