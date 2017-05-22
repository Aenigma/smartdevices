#!/usr/bin/node
const express = require('express');
const app = express();
const server = require('http').createServer(app);

const sio = require('socket.io')(server);

const morgan = require('morgan');

const ios = require('./lib/mqttservice');

app.use(morgan('combined'));
app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
  res.send('hello world!');
});

ios(sio);

server.listen(3000);
