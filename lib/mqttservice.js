const mqtt = require('mqtt')
  .connect('mqtt://mqtt.compbox.org');
const SensorService = require('./sensors');

const gpio = require('./gpioservice');
const DigitalIO = gpio.DigitalIO;
const DigitalPoller = gpio.DigitalPoller;

const OUT_PIN = 18;
const IN_PIN = 4;
function registerIO(io) {
  const clientTable = new Map();
  const ss = new SensorService('sensor');

  const dios = new DigitalIO(OUT_PIN);
  const dps = new DigitalPoller();

  dps.handle(IN_PIN, 'sensor', (state) => {
    mqtt.publish('sensor', (!!state).toString());
  });

  const relay = {
    state: false
  };

  io.on('connection', (socket) => {
    registerSocket(socket);
    io.emit('update', update());
  });

  mqtt.subscribe('sensor');
  mqtt.subscribe('relay');

  mqtt.on('message', (topic, message) => {
    // some kind of dispatcher here
    const dispatcher = {
      sensor: () => {
        ss.state = (message == 'true');
        console.log('Event %s at %s', ss.history.length, ss.state.time);
        io.emit('update', update());
      },
      relay: () => {
        relay.state = (message == 'true');
        dios.state = relay.state;
        io.emit('update', update());
      }
    };

    if(dispatcher[topic]) dispatcher[topic]();
  });

  function registerSocket(socket) {
    const socketId = socket.id;
    const clientIp = socket.request.connection.remoteAddress;

    console.log("%s connected; %s", socketId, clientTable.entries());

    clientTable.set(socketId, clientIp);

    socket.on('relay', (data) => {
      mqtt.publish('relay', data.enabled.toString());
    });

    socket.on('disconnect', () => {
      console.log("%s disconnected; %s", socketId, clientTable.entries());
      clientTable.delete(socketId);
      io.emit('update', update());
    });
  }

  function update() {
    return {
      version: '0',
      relay: {
        enabled: relay.state
      },
      sensor: ss.last(),
      users: {
        count: clientTable.size
      }
    };
  }
}

module.exports = registerIO;
