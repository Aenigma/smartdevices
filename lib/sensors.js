const moment = require('moment');

/**
 * Primarily, acts as a store to translate sensor events to something smarter
 */
class SensorService {
  /**
   * Instance will listen to the emitter and resend evnets on listener
   */
  constructor(id) {
    this.id = id;
    this.history = [];
  }

  set state(state) {
    return this.update(state);
  }

  get state() {
    return this.last();
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

module.exports = SensorService;
