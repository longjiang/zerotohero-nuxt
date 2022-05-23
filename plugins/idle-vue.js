import IdleVue from 'idle-vue'
import Vue from 'vue'
import Vuex from 'vuex'

const eventsHub = new Vue()

const store = new Vuex.Store({
  // ...
})

Vue.use(IdleVue, {
  eventEmitter: eventsHub,
  store,
  idleTime: 300000 // If a user is inactive for 300 seconds, we stop logging their time unless they start interacting again
})