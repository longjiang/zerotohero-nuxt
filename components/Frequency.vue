<template>
  <div :class="{'frequency-wrapper': true, 'd-inline-block': true, mini: mini}">
    <div class="frequency mt-1">
      <div
        class="frequency-fill"
        :data-bg-level="entry.level"
        :style="`width: ${(entry.frequency - 2.5) / 4.5 * 100}%`"
      ></div>
    </div>
    <small v-if="showText" class="text-center mt-2 frequency-text">
      <b >Frequency: {{ entry.frequency }}</b> <small> – appears 10<sup>{{ entry.frequency }}</sup> times in a billion words, or once every {{ formatK(Math.ceil(1000000000 / Math.pow(10, entry.frequency)), 2, this.$l1.code) }} words.</small>
    </small>
  </div>
</template>

<script>
import { formatK } from '@/lib/utils'

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
}

.frequency-text {
  line-height: 1.33;
  display: block;
}

.frequency-fill {
  background: #88b1a2;
  height: 0.3rem;
}

.frequency-level {
  font-weight: bold;
}

.frequency-wrapper.mini .frequency-level {
  font-size: 0.8em;
  width: 5.5em;
}

</style>
