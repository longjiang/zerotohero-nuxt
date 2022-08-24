<template>
  <div v-if="!loaded" class="hydration-notice text-center" style="background: #000">
    <div class="text-white">
      <b>Loading app...</b> App unresponsive? <router-link :to="{ lastFullHistoryPath }" style="color: #18d342"><u>Refresh.</u></router-link>
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
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
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