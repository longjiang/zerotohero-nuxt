<template>
  <div :class="`annotation-settings annotation-settings-${variant}`">
    <div class="mt-3">
      <b-form-checkbox class="my-1" v-model="localL2Settings.showDefinition" @change="updateL2Settings" switch>
        {{ $t("Show definition above words") }}
      </b-form-checkbox>
      <b-form-checkbox class="my-1" v-model="localL2Settings.disableAnnotation" @change="updateL2Settings" switch>
        {{ $t("Disable popup dictionary") }}
      </b-form-checkbox>
      <b-form-checkbox class="my-1" v-model="localL2Settings.useSerif" @change="updateL2Settings" switch>
        <template v-if="localL2Settings.useSerif">{{ $t('Use Serif') }}</template>
        <template v-else>{{ $t('Use Sans-Serif') }}</template>
      </b-form-checkbox>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
const defaultSettings = {
  zoomLevel: 0,
  autoPronounce: true,
  adminMode: false,
  onceAdmin: false,
  showDefinition: undefined,
  showTranslation: undefined,
  showQuickGloss: undefined,
  showPinyin: undefined,
  useTraditional: undefined,
  showQuiz: undefined,
  useSerif: undefined,
  showByeonggi: undefined,
  disableAnnotation: undefined,
  quizMode: false,
  skin: null,
};
export default {
  props: {
    variant: {
      default: "page", // or 'toolbar'
    },
  },
  data() {
    return {
      localL2Settings: {
        showDefinition: false,
        disableAnnotation: false,
        useSerif: false // default
      },
      ...defaultSettings,
    };
  },
  computed: {
    ...mapState("settings", ["l2Settings", "l1", "l2", "settingsLoaded"]),
    userIsAdmin() {
      return this.$auth.user && this.$auth.user.role == 1;
    },
  },
  created() {
    if (this.settingsLoaded) {
      this.initializeLocalL2Settings();
    }
  },
  watch: {
    settingsLoaded(loaded) {
      if (loaded) {
        this.initializeLocalL2Settings();
      }
    },
    adminMode() {
      this.$store.dispatch("settings/setGeneralSettings", {
        adminMode: this.adminMode,
      });
    },
    skin() {
      this.$store.dispatch("settings/setGeneralSettings", {
        skin: this.skin,
      });
    },
    // More watchers are set up in setupWatchers()
  },
  methods: {
    loadSettings() {
      if (!this.$l2.code) return;
      if (!this.$l2Settings) return;
      for (let property in defaultSettings) {
        if (this[property] !== this.$l2Settings[property])
          this[property] = this.$l2Settings[property];
      }
      if (this.adminMode) this.onceAdmin = true;
    },
    setupWatchers() {
      for (let property in defaultSettings) {
        this.$watch(property, (newValue, oldValue) => {
          let payload = {};
          payload[property] = newValue;
          this.$store.dispatch("settings/setL2Settings", payload);
        });
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
    updateL2Settings(payload) {
      if (!payload) payload = this.localL2Settings;
      this.$store.dispatch("settings/setL2Settings", payload);
    },
  },
};
</script>
<style lang="scss" scoped>
@import "~@/assets/scss/variables.scss";

.translated-line {
  color: #aaa;
  font-style: italic;
  font-size: 0.8em;
}

.translated-line {
  display: none;
}

.show-translation .translated-line {
  display: inherit;
}

.annotation-setting-toggle {
  margin: 0 0.2rem;
  cursor: pointer;
}

.annotation-setting-toggle-active {
  color: $primary-color;
}

.annotation-setting-icon {
  width: 2rem;
  text-align: center;
  display: inline-block;
}

hr {
  margin: 0.5rem 0;
}
</style>
