const rpio = require('rpio');

rpio.init({mapping: 'gpio'});

// sends data to io based on mqtt signals
class DigitalPoller {
  constructor() {
    this.pins = [];
  }

  handle(pin, name, cb, direction=rpio.POLL_BOTH) {
    this.pins = [...this.pins, pin];
    rpio.open(pin, rpio.INPUT, rpio.PULL_DOWN);
    let last;
    rpio.poll(pin, () => {
      const current = rpio.read(pin);
        if(last === current) {
          console.warn('pin (%s) poll ignored; same as last (%s)', pin, last);
          return;
        }
        last = current;
      cb(current);
    }, direction);
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
module.exports.DigitalPoller = DigitalPoller;
