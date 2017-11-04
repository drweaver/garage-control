#!/bin/bash

#docker pull handymoose/rpi:garage-control

docker run --restart=always --privileged --add-host=mqtt:192.168.0.27 -d --name garage-control handymoose/rpi:garage-control
