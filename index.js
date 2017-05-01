#!/usr/bin/node

const rpio = require('rpio');

const moment = require('moment');

const express = require('express');
const app = express();
const server = require('http').createServer(app);

const sio = require('socket.io')(server);

const morgan = require('morgan');

const pin = 4;

function sensorData() {
  function getPinData() {
    return {pin: pin, state: rpio.read(pin)};
  }

  let last = dataLog.slice(-1).pop();
  return Object.assign(getPinData(), {
    last: last ? last.time : 0
  });
}

rpio.init({mapping: 'gpio'});
rpio.open(pin, rpio.INPUT);

app.use(morgan('combined'));
app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
  res.send('hello world!');
});

function emitClients() {
  sio.sockets.clients((err, clients) => {
    if(err) throw err;
    console.log(clients);
    sio.emit('user', {
      count: clients.length
    });
  });
}

sio.on('connection', (socket) => {
  var socketId = socket.id;
  var clientIp = socket.request.connection.remoteAddress;

  console.log(clientIp);

  socket.emit('sensor', sensorData());
  socket.on('update', (data) => {
    socket.emit('sensor', sensorData());
  });
  socket.on('disconnect', () => emitClients());
  emitClients();
});

server.listen(3000);

let dataLog = [];

rpio.poll(pin, (e) => {
  let p = sensorData();
  let last = sensorData.last;

  if(last && p.state === last.state) {
    console.log("ignored event");
    return;
  }

  if(p.state) {
    let data = {time: moment().valueOf(), state: p.state};
    dataLog = [...dataLog, data];
    p.last = data.time;

    console.log("Event %s at %s", dataLog.length, data.time);
  }

  sio.emit('sensor', p);
});
