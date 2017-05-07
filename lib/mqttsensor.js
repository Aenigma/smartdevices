const gpio = require('./gpioservice');
const SensorPublisher = gpio.SensorPublisher;

const mqtt = require('./mqtthandler').mock;

// test only
const EventEmitter = require('events');
let io = new EventEmitter();

let publisher = new SensorPublisher(io);
let handler = new MqttHandler('mqtt://mqtt.compbox.org');

publisher.handle(4, 'sensor');
// handler.em

