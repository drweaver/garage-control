

Node.js implementation of Garage server and client.  Uses [PiFace Digital](http://www.piface.org.uk/products/piface_digital/) module for sensors and relay.

This uses `socket.io` with a static `express` server.

## Config

Create a config.json file in the root folder with the following format:

```
{ 
    "notify": {
        "interval": 600,
        "openAlert": 900
    },
    "pfio": {
        "relay": 0,
        "opened": 1,
        "closed": 0
    },
    "pos": {
        "distance": 3,
        "lat": xx.xxx,
        "lng": yy.xxx
    },
    "pushbullet": {
        "link": "https://www.location.of.my.garagecontrol.com"
    }
}
```

* `notify interval` is in seconds and represents how often to check status of door
* `notify openAlert` is limit when to send an alert 
* `pfio relay` is the PiFace relay connected to the garage door opener switch
* `pfio opened` is the PiFace input which is triggered when the door is opened
* `pfio closed` is the PiFace input which is triggered when the door is closed
* `pos distance` is the allowed distance from the coords to authorise open/close operation
* `pos lat/lng` is the coordinates of your garage to enforce the distance authorisation (Note, this can also be provided with a LATLNG environment variable as "x,y"
* `pushbullet link` is the link provided in the pushbullet notification to get back garage control site

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
