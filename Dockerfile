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

FROM handymoose/rpi:node.v6.9.4

#WORKDIR /libmcp23s17/
#COPY --from=builder /libmcp23s17/ .
#COPY --from=builder /usr/local/lib/libpiface-1.0.a .

WORKDIR /garage-control/
#COPY package.json /garage-control/
COPY index.js /garage-control/
COPY lib /garage-control/lib/

COPY --from=builder /garage-control/node_modules node_modules

CMD node index.js

