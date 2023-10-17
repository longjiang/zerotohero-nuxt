// settings-mixin.js

import { mapState } from "vuex";

export default {
  data() {
    return {
      localSettings: {},
      localL2Settings: {
        useSerif: false // explicitly declare these properties so they are reactive
      },
    };
  },
  created() {
    if (this.settingsLoaded) {
      this.initializeLocalSettings();
      this.initializeLocalL2Settings();
    }
  },
  computed: {
    ...mapState("settings", ["l2Settings", "l1", "l2", "settingsLoaded"]),
  },
  watch: {
    settingsLoaded(loaded) {
      if (loaded) {
        this.initializeLocalSettings();
      }
    },
  },
  methods: {
    initializeLocalSettings() {
      for (let key in this.$store.state.settings) {
        if (!["l1", "l2"].includes(key)) {
          const value = this.$store.state.settings[key];
          this.localSettings[key] = value
            ? JSON.parse(JSON.stringify(value))
            : value;
        }
      }
    },
    initializeLocalL2Settings() {
      console.log("initializeLocalL2Settings");
      if (!this.$l2Settings) return;
      for (let key in this.$l2Settings) {
        // mapped to $store.state.settings.l2Settings[l2Code]
        const value = this.$l2Settings[key];
        // We clone it to the local state so we don't get vuex warnings
        this.localL2Settings[key] = value
          ? JSON.parse(JSON.stringify(value))
          : value;
      }
    },
    updateSettings() {
      this.$store.dispatch("settings/setGeneralSettings", this.localSettings);
    },
    updateL2Settings(payload) {
      if (!payload) payload = this.localL2Settings;
      this.$store.dispatch("settings/setL2Settings", payload);
    },
  },
};
