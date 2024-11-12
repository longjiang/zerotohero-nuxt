<template>
  <div class="annotation-settings">
    <div class="container text-center my-5" v-if="!settingsLoaded">
      <Loader message="Loading settings..." :sticky="true" />
      <div class="row">
        <div class="col-sm-12"></div>
      </div>
    </div>
    <div v-else>
      <div class="quick-settings-language-specific" v-if="$l1 && $l2">
        <div class="bg-gray rounded p-2" :class="annotationSettingsClass">
          <TokenizedText class="text-center" :text="$l2.vernacularName || 'Example'" />
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
            v-model="localL2Settings.zoomLevel"
            @change="updateL2Settings"
          ></b-form-input>
        </div>
        <Toggle
          v-model="localL2Settings.showPinyin"
          label="Show Phonetics"
          @change="updateL2Settings"
        >
          <span style="font-size: 0.8em; font-weight: bold">
            <ruby v-if="$l2.han" style="position: relative; bottom: -0.1rem">
              拼
              <rt>pīn</rt>
            </ruby>
            <ruby v-else-if="$l2.code === 'ja'">
              仮
              <rt>か</rt>
            </ruby>
            <ruby
              v-else-if="
                $l2.scripts &&
                $l2.scripts[0] &&
                $l2.scripts[0].script === 'Arab'
              "
            >
              نص
              <rt>naṣṣ</rt>
            </ruby>
            <span v-else>[pʰ]</span>
          </span>
        </Toggle>
        <Toggle
          v-model="localL2Settings.phoneticsOnly"
          @change="updateL2Settings"
          label="Phonetics Only"
        >
          Āぁ
        </Toggle>
        <Toggle
          v-model="localL2Settings.showDefinition"
          @change="updateL2Settings"
          label="Show Definition"
        >
          <i class="fa-solid fa-circle-info"></i>
        </Toggle>
        <Toggle
          v-if="$l2.han"
          v-model="localL2Settings.useTraditional"
          @change="updateL2Settings"
          :label="
            localL2Settings.useTraditional
              ? 'Show Traditional'
              : 'Show Simplified'
          "
        >
          <span>
            <span v-if="localL2Settings.useTraditional">繁</span>
            <span v-if="!localL2Settings.useTraditional">简</span>
          </span>
        </Toggle>
        <Toggle
          v-model="localL2Settings.showTranslation"
          @change="updateL2Settings"
          label="Show Translation"
        >
          <i class="fas fa-language"></i>
        </Toggle>
        <Toggle
          v-model="localL2Settings.showQuickGloss"
          @change="updateL2Settings"
          label="Show Gloss for Saved"
        >
          <i class="fas fa-text-size"></i>
        </Toggle>
        <Toggle
          v-if="['ko', 'vi'].includes($l2.code)"
          v-model="localL2Settings.showByeonggi"
          @change="updateL2Settings"
          :label="{ ko: 'Show Hanja', vi: 'Show Han Tự' }[$l2.code]"
        >
          <span>
            <span style="font-size: 0.9em">{{ { ko: "자", vi: "Tự" }[$l2.code] }}</span
            ><small style="font-size: 0.5em">字</small>
          </span>
        </Toggle>
        <Toggle
          v-model="localL2Settings.autoPronounce"
          @change="updateL2Settings"
          label="Auto Pronounce"
        >
          <i class="fa fa-volume-up"></i>
        </Toggle>
        <Toggle
          v-model="localL2Settings.quizMode"
          @change="updateL2Settings"
          label="Saved Words as Blanks"
        >
          <i class="fa-solid fa-pen-line"></i>
        </Toggle>
        <hr />
      </div>
      <div class="quick-settings-general">
        <Toggle v-model="isDarkMode" @change="updateSettings" label="Dark Mode">
          <i class="fa fa-moon"></i>
        </Toggle>
        <Toggle
          v-if="userIsAdmin"
          v-model="localSettings.adminMode"
          @change="updateSettings"
          label="Admin Mode"
        >
          <i class="fa fa-wrench"></i>
        </Toggle>
        <!-- make a select drop down menu -->
        
        <div>
          <i class="fa-solid fa-lips mx-1"></i>
          <b-dropdown
            size="sm"
            :items="words"
            :text="$t('Choose Speech Voice')"
            variant="light"
          >
            <b-dropdown-item
              v-for="(voice, index) in voices"
              :key="index"
              @click="selectVoice(voice)"
            >
              {{ voice.name }} <template v-if="!voice.localService">(Remote)</template>
            </b-dropdown-item>
          </b-dropdown>
        </div>

        <hr />
        <div :class="`annotation-setting-toggle`" v-if="$l1 && $l2">
          <router-link :to="{ name: 'l1-l2-settings' }" class="text-success">
            <i class="fa-solid fa-gears annotation-setting-icon"></i
            >{{ $tb("More Settings") }}
            <i class="fa-solid fa-chevron-right"></i>
          </router-link>
        </div>
        <div :class="`annotation-setting-toggle`">
          <router-link
            v-if="
              $auth && $auth.loggedIn && $auth.user && $auth.user.first_name
            "
            to="/logout"
            class="text-success"
          >
            <i class="fa-solid fa-person-to-door annotation-setting-icon"></i
            >{{ $tb("Logout") }}
            <i class="fa-solid fa-chevron-right"></i>
          </router-link>
          <router-link v-else to="/login" class="text-success">
            <i
              class="fa-solid fa-right-from-bracket annotation-setting-icon"
            ></i
            >{{ $tb("Login") }}
            <i class="fa-solid fa-chevron-right"></i>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import settingsMixin from "../../lib/mixins/settings-mixin";
import { SpeechSingleton } from "../../lib/utils";

export default {
  mixins: [settingsMixin],
  methods: {
    selectVoice(voice) {
      this.localL2Settings.voice = voice.name;
      this.updateL2Settings();
    },
  },
  computed: {
    voices() {
      return SpeechSingleton.instance.getVoices(this.$l2.code);
    },
    isDarkMode: {
      get() {
        return this.localSettings.skin === "dark";
      },
      set(value) {
        this.localSettings.skin = value ? "dark" : "light";
      },
    },
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
};
</script>
<style lang="scss" scoped>
@import "./styles.scss";
</style>
