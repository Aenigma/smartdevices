const rpio = require('rpio');
const moment = require('moment');

rpio.init({mapping: 'gpio'});

class SensorPublisher {
	constructor(listener) {
		this.listener = listener;
		this.pins = [];
	}

	handle(pin, name, direction=rpio.POLL_BOTH) {
		this.pins = [...this.pins, pin];
		rpio.open(pin, rpio.INPUT, direction);
		rpio.poll(pin, () => {
			this.listener.emit(name, rpio.read(pin));
		});
	}

	close() {
		this.pins.forEach((x) => rpio.close(x));
	}
}

/**
 * Primarily, acts as a store to translate sensor events to something smarter
 */
class SensorService {
  /**
   * Instance will listen to the emitter and resend evnets on listener
   */
  constructor(emitter, listener, id=null) {
	  this.id = id;
	  this.history = [];
  }

  update(state) {
    let last = this.last();

    if (!state) {
      return last;
    }

    let log = {time: moment().valueOf(), state: state};
    this.history = [...this.history, log];

    return this._wrap(log);
  }

  last() {
    let last = this.history.slice(-1).pop();

    return this._wrap(last);
  }

  _wrap(entry) {
    if (!this.id) return entry;

    return Object.assign({id: this.id}, entry);
  }
}
