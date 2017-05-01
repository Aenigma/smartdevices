moment.relativeTimeThreshold('ss', 10);
var app = new Vue({
  el: '#app',
  template: `
  <div>
    <div v-bind:class="classObj" role="alert">
      <p>{{ message }}</p>
    </div>
    <div>Last Event: {{lastHuman}}</div>
    <div class="checkbox">
      <label title="Only works if you have a vibrator, obviously">
        <input type="checkbox" v-model="vibrate" :disabled="!vibrateEnabled"> I want to feel him kick
      </label>
    </div>
    <div>
      You are currently one of {{users}} people watching this right now.
    </div>
  </div>`,
  data: {
    socket: io.connect(),
    status: '',
    users: 1,
    lastTimestamp: 0,
    currentTime: moment(),
    vibrateEnabled: !!navigator.vibrate,
    vibrate: false
  },
  computed: {
    message: function() {
      return "Kevin is " + (this.status ? "kicking 😱" : "dead 😁");
    },
    classObj: function() {
      return {
        alert: true,
        'alert-danger': !this.status,
        'alert-info': this.status,
      }
    },
    lastHuman: function() {
      if(!this.lastTimestamp) {
        return "Never";
      }
      return moment
        .duration(moment
          .min(this.currentTime, moment(this.lastTimestamp))
          .diff(this.currentTime))
        .humanize(true);
    }
  },
  methods: {
    updateSensor: function(data) {
      if(this.vibrate && !this.status && data.state && navigator.vibrate) {
        navigator.vibrate([300, 50, 300]);
      }
      this.status = data.state;
      this.lastTimestamp = data.last;
      console.log(data);
    },
    updateUsers: function(data) {
      this.users = data.count;
    }
  },
  created: function() {
    var self = this;

    setInterval(() => {
      this.currentTime = moment();
    }, 1000);

    this.socket.on('sensor', this.updateSensor);
    this.socket.on('user', this.updateUsers);
  }
});
