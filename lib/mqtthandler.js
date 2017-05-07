const mqtt = require('mqtt');
const EventEmitter = require('events');

class MqttHandler {
  constructor(uri) {
    this.mc = mqtt.connect(uri);
    this.em = new EventEmitter();

    this.mc.on('message', (topic, msg) => {
      this.em.emit(topic, msg.toString());
    });
  }

  handle(topic, handler) {
    this.mc.subscribe(topic);
    this.em.on(topic, handler);
  }

  end() {
    this.mc.end();
  }
}

class MockMqttHandler {
  constructor() {
    this.em = new EventEmitter();
  }

  handle(topic, handler) {
    this.em.on(topic, handler);
  }

  end() {}
}

module.exports.mock = MockMqttHandler;
module.exports.mqtt = MqttHandler;
