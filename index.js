#!/usr/bin/node

const rpio = require('rpio');

const moment = require('moment');

const express = require('express');
const app = express();
const server = require('http').createServer(app);

const sio = require('socket.io')(server);

const morgan = require('morgan');

const pin = 4;

const relayPin = 18;

rpio.init({mapping: 'gpio'});
rpio.open(pin, rpio.INPUT);
rpio.open(relayPin, rpio.OUTPUT);

app.use(morgan('combined'));
app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
  res.send('hello world!');
});

var dataLog = [];
var clientTable = new Map();

function sensorData() {
  function getPinData() {
    return {pin: pin, state: rpio.read(pin)};
  }

  let last = dataLog.slice(-1).pop();
  return Object.assign(getPinData(), {
    last: last ? last.time : 0
  });
}

function update() {
  return {
    version: '0',
    relay: {
      enabled: rpio.read(relayPin)
    },
    sensor: sensorData(),
    users: {
      count: clientTable.size
    }
  };
}

sio.on('connection', (socket) => {
  var socketId = socket.id;
  var clientIp = socket.request.connection.remoteAddress;

  clientTable.set(socketId, clientIp);

  socket.on('update', () => sio.emit(update()));

  socket.on('relay', (data) => {
    rpio.write(relayPin, data.enabled ? rpio.HIGH : rpio.LOW);
    sio.emit('update', update());
  });

  socket.on('disconnect', () => {
    console.log(clientTable.entries());
    clientTable.delete(socketId);
    sio.emit('update', update());
  });

  socket.emit('update', update());
});

server.listen(3000);

rpio.poll(pin, () => {
  let p = sensorData();
  let last = sensorData.last;

  if(last && p.state === last.state) {
    console.log('ignored event');
    return;
  }

  if(p.state) {
    let data = {time: moment().valueOf(), state: p.state};
    dataLog = [...dataLog, data];
    p.last = data.time;

    console.log('Event %s at %s', dataLog.length, data.time);
  }

  sio.emit('update', update());
});
