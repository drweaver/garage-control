### BUILDER ###
FROM handymoose/rpi:node.v6.9.4 as builder
WORKDIR /
RUN apt-get update &&  apt-get install -y automake libtool git make python build-essential
RUN git clone https://github.com/piface/libmcp23s17.git
RUN git clone https://github.com/piface/libpifacedigital.git
WORKDIR /libmcp23s17/
RUN make && make install
WORKDIR /libpifacedigital/
RUN make && make install
WORKDIR /garage-control/
COPY package.json /garage-control/
RUN npm install


### GARAGE-CONTROL ###
FROM handymoose/rpi:node.v6.9.4
WORKDIR /garage-control/
COPY index.js .
COPY lib lib
COPY --from=builder /garage-control/node_modules node_modules
CMD node index.js

