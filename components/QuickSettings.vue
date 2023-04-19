<template>
  <div :class="`annotation-settings annotation-settings-${variant}`">
    <div class="bg-gray rounded" :class='{
      "show-pinyin": $l2Settings.showPinyin,
      "show-pinyin-for-saved":
        !$l2Settings.showPinyin && l2 && l2.han,
      "show-simplified": !$l2Settings.useTraditional,
      "show-traditional": $l2Settings.useTraditional,
      "show-definition": $l2Settings.showDefinition,
      "show-translation": $l2Settings.showTranslation,
      "show-quick-gloss": $l2Settings.showQuickGloss,
      "show-byeonggi": $l2Settings.showByeonggi,
      "use-serif": $l2Settings.useSerif,
      [`zerotohero-zoom-${$l2Settings.zoomLevel}`]: true,
    }'>
      <Annotate class="text-center" :useZoom="true"><span>本は</span></Annotate>
    </div>
    <div class="quick-settings-language-specific" v-if="$l1 && $l2">
      <Toggle v-model="quizMode" label="Quiz Mode">
        <i class="far fa-rocket-launch"></i>
      </Toggle>
      <Toggle v-model="autoPronounce" label="Auto Pronounce">
        <i class="fa fa-volume-up"></i>
      </Toggle>
      <Toggle v-model="showDefinition" label="Show Definition">
        <i class="fa-solid fa-circle-info"></i>
      </Toggle>
      <Toggle v-model="showPinyin" label="Show Phonetics">
        <span style="font-size: 0.8em; font-weight: bold">
          <ruby v-if="$l2.han" style="position: relative; bottom: -0.1rem">
            拼
            <rt>pīn</rt>
          </ruby>
          <ruby v-else-if="$l2.code === 'ja'">
            假
            <rt>か</rt>
          </ruby>
          <ruby v-else-if="
            $l2.scripts && $l2.scripts[0] && $l2.scripts[0].script === 'Arab'
          ">
            نص
            <rt>naṣṣ</rt>
          </ruby>
          <span v-else>[pʰ]</span>
        </span>
      </Toggle>
      <Toggle v-if="$l2.han" v-model="useTraditional" :label="useTraditional ? 'Traditional' : 'Simplified'">
        <span>
          <span v-if="useTraditional">繁</span>
          <span v-if="!useTraditional">简</span>
        </span>
      </Toggle>
      <Toggle v-model="showTranslation" label="Translation">
        <i class="fas fa-language"></i>
      </Toggle>
      <Toggle v-model="showQuickGloss" label="Show Quick Gloss">
        <i class="fas fa-text-size"></i>
      </Toggle>
      <Toggle v-if="['ko', 'vi'].includes($l2.code)" v-model="showByeonggi"
        :label="{ ko: 'Hanja', vi: 'Han Tự' }[$l2.code]">
        <span>
          <span>{{ { ko: '자', vi: 'Tự' }[$l2.code] }}</span>
          <small style="font-size: 0.5em">字</small>
        </span>
      </Toggle>

      <button class="btn btn-unstyled d-block p-0 annotation-setting-toggle"
        @click="zoomLevel = zoomLevel ? Math.max(zoomLevel - 1, 0) : 0">
        <span class="annotation-setting-icon">ᴛ</span>
        {{ $tb("Smaller text") }}
      </button>
      <button class="btn btn-unstyled d-block p-0 annotation-setting-toggle"
        @click="zoomLevel = zoomLevel ? Math.min(zoomLevel + 1, 7) : 1">
        <span class="annotation-setting-icon">T</span>
        {{ $tb("Bigger text") }}
      </button>
      <hr />
    </div>
    <div class="quick-settings-general">
      <Toggle v-model="darkMode" label="Dark Mode">
        <i class="fa fa-moon"></i>
      </Toggle>
      <Toggle v-if="userIsAdmin" v-model="adminMode" label="Admin Mode">
        <i class="fa fa-wrench"></i>
      </Toggle>
      <hr />
      <div :class="`annotation-setting-toggle`">
        <router-link :to="{ name: 'settings' }" class="text-success">
          <i class="fa-solid fa-gears annotation-setting-icon"></i>
          {{ $tb("More Settings") }}
          <i class="fa-solid fa-chevron-right"></i>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export const defaultL2Settings = {
  l1: "en", // the L1 the user used last time when they studied this language
  showDefinition: false,
  showPinyin: true,
  useTraditional: false,
  showTranslation: true,
  showQuickGloss: true,
  useSerif: false,
  showQuiz: true,
  showByeonggi: true,
  tvShowFilter: "all", // By default we only search TV shows.
  talkFilter: "all", // By default we search all talks.
  autoPronounce: true, // Whether or not to play the audio automatically when opening a WordBlock popup
  quizMode: false,
  disableAnnotation: false,
  zoomLevel: 0,
};

export const defaultGeneralSettings = {
  adminMode: false,
  skin: "dark",
  preferredCategories: [],
  layout: "vertical", // or 'horizontal'
  autoPause: false,
  speed: 1,
  hideWord: false, // as used in the <HideDefs> component
  hidePhonetics: false, // as used in the <HideDefs> component
  hideDefinitions: false, // as used in the <HideDefs> component
  subsSearchLimit: true,
  openAIToken: undefined,
};

export default {
  props: {
    variant: {
      default: "page", // or 'toolbar'
    },
  },
  data() {
    return Object.assign(
      {
        unsubscribe: null,
        onceAdmin: false,
        darkMode: true,
      },
      defaultGeneralSettings,
      defaultL2Settings
    );
  },
  mounted() {
    this.loadSettings();
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type === "settings/LOAD_SETTINGS") {
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
      if (!this.$l2?.code) return;
      if (!this.$l2Settings) return;
      for (let property in defaultL2Settings) {
        if (this[property] !== this.$l2Settings[property]) {
          this[property] = this.$l2Settings[property];
        }
      }
      for (let property in defaultGeneralSettings) {
        if (this[property] !== this.$store.state.settings[property]) {
          this[property] = this.$store.state.settings[property];
        }
      }
      if (this.adminMode) this.onceAdmin = true;
    },
    setupWatchers() {
      for (let property in defaultL2Settings) {
        this.$watch(property, (newValue, oldValue) => {
          let payload = {};
          payload[property] = newValue;
          this.$store.dispatch("settings/setL2Settings", payload);
        });
      }
      for (let property in defaultGeneralSettings) {
        this.$watch(property, (newValue, oldValue) => {
          let payload = {};
          payload[property] = newValue;
          this.$store.dispatch("settings/setGeneralSettings", payload);
        });
      }
    },
  },
  watch: {
    $l2() {
      this.loadSettings();
    },
    darkMode() {
      this.skin = this.darkMode ? "dark" : "light";
    },
    // More watchers are set up in setupWatchers()
  },
};
</script>
<style lang="scss">
@import "~@/assets/scss/variables.scss";

.toggle-wrapper {
  margin: 0.25rem 0;
}

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
