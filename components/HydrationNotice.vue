<template>
  <div v-if="!loaded" class="hydration-notice text-center" style="background: #000">
    <div class="text-white">
      <b>{{ $tb('Loading app...') }}</b> {{ $tb('App unresponsive?') }} <router-link :to="{ lastFullHistoryPath }" style="color: #18d342"><u>{{ $tb('Refresh') }}</u></router-link>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  data() {
    return { loaded: false };
  },
  mounted() {
    this.loaded = true;
  },
  computed: {
    ...mapState("fullHistory", ["fullHistory"]),
    lastFullHistoryPath() {
      if (this.fullHistory) {
        let lastFullHistoryItem = this.fullHistory[this.fullHistory.length - 1];
        if (lastFullHistoryItem && lastFullHistoryItem.path) {
          return lastFullHistoryItem.path;
        }
      }
    },
  },
};
</script>

<style>
.hydration-notice {
  padding: 1rem;
  padding-top: calc(1rem + env(safe-area-inset-top));
  position: sticky;
  z-index: 1;
}
</style>