

Node.js implementation of Garage door control.  Uses [PiFace Digital](http://www.piface.org.uk/products/piface_digital/) module for sensors and relay.

## Config

Modify the doors.json file in the root folder 

* `close_pin` is the PiFace input pin determining closed status [0-7]
* `relay_pin` is the PiFace relay pin that will operate the door [0,2] 

## Running the server

Set the following MQTT environment variables:

* MQTT_URL
* MQTT_USERNAME
* MQTT_PASSWORD

Start server with:

`node index.js`

##FAQs

* PiFace isn't working
  * Check to ensure you've [enabled SPI module](http://www.piface.org.uk/guides/Install_PiFace_Software/Enabling_SPI/)


