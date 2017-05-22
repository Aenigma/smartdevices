const rpio = require('rpio');

rpio.init({mapping: 'gpio'});

// sends data to io based on mqtt signals
class DigitalPoller {
  constructor() {
    this.pins = [];
  }

  handle(pin, name, cb, direction=rpio.POLL_BOTH) {
    this.pins = [...this.pins, pin];
    rpio.open(pin, rpio.INPUT, direction);
    rpio.poll(pin, () => {
      cb(rpio.read(pin));
    });
  }

  close() {
    this.pins.forEach((x) => rpio.close(x));
  }
}

class DigitalIO {
  constructor(pin) {
    this.pin = pin;
    rpio.open(pin, rpio.OUTPUT);
  }

  get state() {
    return rpio.read(this.pin);
  }

  set state(state) {
    return rpio.write(this.pin, state ? rpio.HIGH : rpio.LOW);
  }

  close() {
    this.pins.forEach((x) => rpio.close(x));
  }
}

module.exports.DigitalIO = DigitalIO;
module.module.exports.DigitalPoller = DigitalPoller;
