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
        <input type="checkbox" v-model="vibrate" :disabled="!vibrateEnabled"> I want to feel him kick <small>(Android Only)</small>
      </label>
    </div>
    <div>
      <button class="btn btn-default" v-on:click="toggleRelay" v-bind:style='lightStyleObj'>Turn {{relay ? " Off" : "On"}} Light</button>
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
    relay: false,
    vibrateEnabled: !!navigator.vibrate,
    vibrate: false
  },
  computed: {
    message: function() {
      return "Kevin is " + (this.status ? "kicking 😁" : "dead 😱");
    },
    classObj: function() {
      return {
        alert: true,
        'alert-danger': !this.status,
        'alert-info': this.status,
      }
    },
    lightStyleObj: function() {
      if(!this.relay) {
        return null;
      }
      return {
        'background-color': '#ffff40',
        color: '#2b3e50'
      };
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
      this.lastTimestamp = data.time;
    },
    toggleRelay: function() {
      this.relay = !this.relay;
      this.socket.emit('relay', {
        enabled: this.relay
      });
    },
    update: function(data) {
      console.log(data);
      if (data.sensor) {
        this.updateSensor(data.sensor);
      }

      if (data.relay) {
        this.relay = data.relay.enabled;
      }

      if (data.users) {
        this.users = data.users.count;
      }
    }
  },
  created: function() {
    var self = this;

    setInterval(() => {
      this.currentTime = moment();
    }, 1000);

    this.socket.on('update', this.update);
  }
});
