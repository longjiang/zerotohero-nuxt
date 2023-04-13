<template>
  <div v-if="!loaded" class="hydration-notice text-center" style="background: #000">
    <div class="text-white">
      <b>{{ translate('Loading app...') }}</b> {{ translate('App unresponsive?') }} <router-link :to="{ lastFullHistoryPath }" style="color: #18d342"><u>{{ translate('Refresh') }}</u></router-link>
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
    browserLanguage() {
      if (process.browser) {
        let code = navigator.language.replace(/-.*/, "");
        return code;
      }
      return "en";
    },
  },
  methods: {
    translate(text, data = {}) {
      let code = this.browserLanguage;
      if (this.$languages) return this.$languages.translate(text, code, data);
      else return text;
    },
  }
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