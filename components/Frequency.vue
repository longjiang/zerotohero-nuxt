<template>
  <div :class="{'frequency-wrapper': true, 'd-block': true, mini: mini}">
    <div class="frequency mt-1">
      <div
        class="frequency-fill"
        :data-bg-level="entry.level"
        :style="`width: ${Math.min((entry.frequency - 2.5) / 4.5, 1) * 100}%`"
      ></div>
    </div>
    <small v-if="showText" class="text-center mt-2 frequency-text">
      <i18n path="Frequency: {freq} – appears 10{freqpow} times in a billion words, or once every {occurrence} words." class="mt-1 small" tag="p">
        <template v-slot:freq>{{ entry.frequency }}</template>
        <template v-slot:freqpow><sup>{{ entry.frequency }}</sup></template>
        <template v-slot:occurrence>{{ formatK(Math.ceil(1000000000 / Math.pow(10, entry.frequency)), 2, $l1.code) }}</template>
      </i18n>
    </small>
  </div>
</template>

<script>
import { formatK } from '../lib/utils'

export default {
  props: {
    entry: {
      type: Object
    },
    showText: {
      default: true
    },
    mini: {
      default: false
    },
    showHsk: {
      default: true
    }
  },
  methods: {
    formatK
  }
}
</script>

<style scoped>

.frequency {
  background: #ccc;
  height: 0.3rem;
  width: 100%;
  border-radius: 0.15rem;
}

.frequency-text {
  line-height: 1.33;
  display: block;
}

.frequency-fill {
  background: #88b1a2;
  height: 0.3rem;
  border-radius: 0.15rem;
}

.frequency-level {
  font-weight: bold;
}

.frequency-wrapper.mini .frequency-level {
  font-size: 0.8em;
  width: 5.5em;
}

</style>
