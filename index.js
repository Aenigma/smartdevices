#!/usr/bin/node

const rpio = require('rpio');

const moment = require('moment');

const express = require('express');
const app = express();
const server = require('http').createServer(app);

const sio = require('socket.io')(server);

const pin = 4;

function getPinData() {
  return {pin: pin, state: rpio.read(pin)};
}


rpio.init({mapping: 'gpio'});
rpio.open(pin, rpio.INPUT);

app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
  res.send('hello world!');
});

sio.on('connection', (socket) => {
  socket.emit('news', { hello: 'world'});
  socket.emit('sensor', getPinData());
  socket.on('update', (data) => {
    socket.emit('sensor', getPinData());
  });
});

server.listen(3000);

let dataLog = [];

rpio.poll(pin, (e) => {
  let p = getPinData();
  let last = dataLog.slice(-1).pop();

  if(last && p.state === last.state) {
    console.log("ignored event");
    return;
  }

  let data = {time: moment().valueOf(), state: p.state};

  dataLog = [...dataLog, data];

  console.log(dataLog);
  sio.emit('sensor', p);
});
