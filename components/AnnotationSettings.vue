<template>
  <div :class="`annotation-settings annotation-settings-${variant}`">
    <div class="mt-3">
      <b-form-checkbox
        class="mb-2"
        v-model="showDefinition"
      >
        {{ $t("Show definition above words") }}
      </b-form-checkbox>
      <b-form-checkbox class="mb-2" v-model="disableAnnotation">
        {{ $t("Disable popup dictionary") }}
      </b-form-checkbox>
      <b-button-group class="d-block">
        <b-button
          :variant="!useSerif ? 'secondary' : 'outline-secondary'"
          @click="useSerif = false"
        >
          {{ $t("Use Sans-Serif") }}
        </b-button>
        <b-button
          :variant="useSerif ? 'secondary' : 'outline-secondary'"
          style="font-family: serif"
          @click="useSerif = true"
        >
          {{ $t("Use Serif") }}
        </b-button>
      </b-button-group>
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
    return defaultSettings;
  },
  mounted() {
    this.loadSettings();
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type === "settings/LOAD_JSON_FROM_LOCAL") {
        this.loadSettings();
      }
    });
    this.setupWatchers();
  },
  computed: {
    userIsAdmin() {
      return this.$auth.user && this.$auth.user.role == 1;
    },
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
  },
  watch: {
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
