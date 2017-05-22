const assert = require('assert');
const SensorService = require('../lib/sensors');

describe('SensorService', function() {
  describe('#last()', function() {
    it('should return time of 0 and state of false when no values are added', function() {
      const ss = new SensorService();
      let expected = { time: 0, state: false };

      assert.deepEqual(expected, ss.last());
      assert.deepEqual(expected, ss.state);
    });
  });
  describe('#update(bool)', function() {
    it('should return the value given with timestamp', function() {
      const ss = new SensorService();
      assert.equal(true, ss.update(true).state);
      assert.equal(false, ss.update(false).state);
      assert.deepEqual(true, ss.update(true).state);
    });
  });
});
