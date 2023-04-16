<template>
  <div :class="`annotation-settings annotation-settings-${variant}`">
    <div class="quick-settings-language-specific" v-if="$l1 && $l2">
      <button
        :class="{
          'btn btn-unstyled d-block p-0 annotation-setting-toggle': true,
          'annotation-setting-toggle-active text-success': quizMode,
        }"
        @click="quizMode = !quizMode"
        title="Toggle Quiz Mode"
      >
        <span class="annotation-setting-icon">
          <i class="far fa-rocket-launch"></i>
        </span>
        <span v-if="quizMode">{{ $tb("Quiz Mode On") }}</span>
        <span v-if="!quizMode">{{ $tb("Quiz Mode Off") }}</span>
      </button>
      <button
        @click="autoPronounce = !autoPronounce"
        :class="`btn btn-unstyled d-block p-0 annotation-setting-toggle ${
          autoPronounce ? 'annotation-setting-toggle-active' : ''
        }`"
      >
        <span class="annotation-setting-icon">
          <i class="fa fa-volume-up" v-if="autoPronounce"></i>
          <i class="fas fa-volume-mute" v-else></i>
        </span>
        <span v-if="autoPronounce">{{ $tb("Auto pronounce words") }}</span>
        <span v-else>{{ $tb("Do not auto pronounce words") }}</span>
      </button>
      <button
        @click="showPinyin = !showPinyin"
        :class="`btn btn-unstyled d-block p-0 annotation-setting-toggle ${
          showPinyin ? 'text-success' : ''
        }`"
      >
        <span
          class="annotation-setting-icon"
          style="font-size: 0.8em; font-weight: bold"
        >
          <ruby v-if="$l2.han" style="position: relative; bottom: -0.1rem">
            拼
            <rt>pīn</rt>
          </ruby>
          <ruby v-else-if="$l2.code === 'ja'">
            假
            <rt>か</rt>
          </ruby>
          <ruby
            v-else-if="
              $l2.scripts && $l2.scripts[0] && $l2.scripts[0].script === 'Arab'
            "
          >
            نص
            <rt>naṣṣ</rt>
          </ruby>
          <span v-else>[pʰ]</span>
        </span>
        {{ $tb(showPinyin ? "Phonetics on" : "Phonetics off") }}
      </button>
      <button
        v-if="$l2.han"
        @click="useTraditional = !useTraditional"
        :class="`btn btn-unstyled d-block p-0 annotation-setting-toggle ${
          useTraditional ? 'text-success' : ''
        }`"
      >
        <span class="annotation-setting-icon">
          <span v-if="useTraditional">繁</span>
          <span v-if="!useTraditional">简</span>
        </span>
        {{
          $tb(
            useTraditional ? "Traditional characters" : "Simplified characters"
          )
        }}
      </button>
      <button
        @click="showTranslation = !showTranslation"
        :class="`btn btn-unstyled d-block p-0 annotation-setting-toggle ${
          showTranslation ? 'text-success' : ''
        }`"
      >
        <span class="annotation-setting-icon">
          <i class="fas fa-language"></i>
        </span>
        {{ $tb(showTranslation ? "Translation on" : "Translation off") }}
      </button>
      <button
        @click="showQuickGloss = !showQuickGloss"
        :class="`btn btn-unstyled d-block p-0 annotation-setting-toggle ${
          showQuickGloss ? 'text-success' : ''
        }`"
      >
        <span class="annotation-setting-icon">
          <i class="fas fa-text-size"></i>
        </span>
        {{ $tb(showQuickGloss ? "Quick Gloss on" : "Quick Gloss off") }}
      </button>
      <button
        v-if="$l2.code === 'ko'"
        @click="showByeonggi = !showByeonggi"
        :class="`btn btn-unstyled d-block p-0 annotation-setting-toggle ${
          showByeonggi ? 'text-success' : ''
        }`"
      >
        <span class="annotation-setting-icon">
          자
          <small style="font-size: 0.5em">字</small>
        </span>
        {{ $tb(showByeonggi ? "Hanja On" : "Hanja Off") }}
      </button>
      <button
        v-if="$l2.code === 'vi'"
        @click="showByeonggi = !showByeonggi"
        :class="`btn btn-unstyled d-block p-0 annotation-setting-toggle ${
          showByeonggi ? 'text-success' : ''
        }`"
      >
        <span class="annotation-setting-icon">
          Tự
          <small style="font-size: 0.5em">字</small>
        </span>
        {{ $tb(showByeonggi ? "Han Tự On" : "Han Tự Off") }}
      </button>

      <button
        class="btn btn-unstyled d-block p-0 annotation-setting-toggle"
        @click="zoomLevel = zoomLevel ? Math.max(zoomLevel - 1, 0) : 0"
      >
        <span class="annotation-setting-icon">ᴛ</span>
        {{ $tb("Smaller text") }}
      </button>
      <button
        class="btn btn-unstyled d-block p-0 annotation-setting-toggle"
        @click="zoomLevel = zoomLevel ? Math.min(zoomLevel + 1, 4) : 1"
      >
        <span class="annotation-setting-icon">T</span>
        {{ $tb("Bigger text") }}
      </button>
      <hr />
    </div>
    <div class="quick-settings-general">
      <button
        @click="skin = skin === 'light' ? 'dark' : 'light'"
        :class="`btn btn-unstyled d-block p-0 annotation-setting-toggle ${
          skin === 'dark' ? 'annotation-setting-toggle-active' : ''
        }`"
      >
        <span class="annotation-setting-icon">
          <i v-if="skin === 'dark'" class="fa fa-moon"></i>
          <i v-if="skin === 'light'" class="fa fa-sun"></i>
        </span>
        <span v-if="skin === 'dark'">{{ $tb("Dark Mode On") }}</span>
        <span v-if="skin === 'light'">{{ $tb("Dark Mode Off") }}</span>
      </button>
      <button
        v-if="userIsAdmin"
        @click="adminMode = !adminMode"
        :class="`btn btn-unstyled d-block p-0 annotation-setting-toggle ${
          adminMode ? 'annotation-setting-toggle-active' : ''
        }`"
      >
        <span class="annotation-setting-icon">
          <i class="fa fa-wrench"></i>
        </span>
        <span>{{ $tb("Admin Mode") }}</span>
      </button>
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
    // More watchers are set up in setupWatchers()
  },
};
</script>
<style lang="scss">
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
