<template>
  <div v-if="!loaded" class="hydration-notice p-5 text-center bg-warning">
    <div class="">
      App is unresponsive due to inactivity.
    </div>
    <div class="mt-2">
      <router-link :to="{ lastFullHistoryPath }" class="btn btn-success mt-2">
        <i class="fa-solid fa-arrows-rotate mr-1"></i> Reload App
      </router-link>
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
  position: sticky;
  z-index: 1;
}
</style>