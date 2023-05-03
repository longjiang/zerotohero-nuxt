<template>
  <div :class="`annotation-settings annotation-settings-${variant}`">
    <div class="bg-gray rounded p-2" :class="annotationSettingsClass">
      <Annotate class="text-center" :useZoom="true"
        ><span>{{ $l2.vernacularName || "Example" }}</span></Annotate
      >
      <div class="translation-line text-center">
        {{ $t("Example Translation") }}
      </div>
    </div>
    <div class="text-size">
      <div class="text-size-label">
        <div style="font-size: 0.8rem">{{ $t("Smaller") }}</div>
        <div style="font-size: 1.2rem">{{ $t("Bigger") }}</div>
      </div>
      <b-form-input
        type="range"
        min="0"
        max="7"
        step="1"
        v-model="zoomLevel"
      ></b-form-input>
    </div>
    <div class="quick-settings-language-specific" v-if="$l1 && $l2">
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
      </Toggle>
      <Toggle v-model="showDefinition" label="Show Definition">
        <i class="fa-solid fa-circle-info"></i>
      </Toggle>
      <Toggle
        v-if="$l2.han"
        v-model="useTraditional"
        :label="useTraditional ? 'Show Traditional' : 'Show Simplified'"
      >
        <span>
          <span v-if="useTraditional">繁</span>
          <span v-if="!useTraditional">简</span>
        </span>
      </Toggle>
      <Toggle v-model="showTranslation" label="Show Translation">
        <i class="fas fa-language"></i>
      </Toggle>
      <Toggle v-model="showQuickGloss" label="Show Gloss for Saved">
        <i class="fas fa-text-size"></i>
      </Toggle>
      <Toggle
        v-if="['ko', 'vi'].includes($l2.code)"
        v-model="showByeonggi"
        :label="{ ko: 'Show Hanja', vi: 'Show Han Tự' }[$l2.code]"
      >
        <span>
          <span>{{ { ko: "자", vi: "Tự" }[$l2.code] }}</span
          ><small style="font-size: 0.5em">字</small>
        </span>
      </Toggle>
      <hr />
    </div>
    <div class="quick-settings-general">
      <Toggle v-model="autoPronounce" label="Auto Pronounce">
        <i class="fa fa-volume-up"></i>
      </Toggle>
      <Toggle v-model="darkMode" label="Dark Mode">
        <i class="fa fa-moon"></i>
      </Toggle>
      <Toggle v-model="quizMode" label="Quiz Mode">
        <i class="far fa-rocket-launch"></i>
      </Toggle>
      <Toggle v-if="userIsAdmin" v-model="adminMode" label="Admin Mode">
        <i class="fa fa-wrench"></i>
      </Toggle>
      <hr />
      <div :class="`annotation-setting-toggle`">
        <router-link :to="{ name: 'settings' }" class="text-success">
          <i class="fa-solid fa-gears annotation-setting-icon"></i
          >{{ $tb("More Settings") }}
          <i class="fa-solid fa-chevron-right"></i>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import {
  defaultL2Settings,
  defaultGeneralSettings,
} from "@/components/AnnotationSettings/defaults.js";

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
    annotationSettingsClass() {
      return {
        "show-pinyin": this.$l2Settings.showPinyin,
        "show-pinyin-for-saved":
          !this.$l2Settings.showPinyin && this.$l2 && this.$l2.han,
        "show-simplified": !this.$l2Settings.useTraditional,
        "show-traditional": this.$l2Settings.useTraditional,
        "show-definition": this.$l2Settings.showDefinition,
        "show-translation": this.$l2Settings.showTranslation,
        "show-quick-gloss": this.$l2Settings.showQuickGloss,
        "show-byeonggi": this.$l2Settings.showByeonggi,
        "use-serif": this.$l2Settings.useSerif,
        [`zerotohero-zoom-${this.$l2Settings.zoomLevel}`]: true,
      };
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
    skin() {
      this.darkMode = this.skin === "dark";
    },
    darkMode() {
      this.skin = this.darkMode ? "dark" : "light";
    },
    // More watchers are set up in setupWatchers()
  },
};
</script>
<style lang="scss">
@import "@/components/AnnotationSettings/styles.scss";
</style>
