// ~/plugins/global-mixin.js
import Vue from "vue";
import { mapState } from "vuex";

Vue.mixin({
  computed: {
    ...mapState("fullHistory", ["fullHistory", "lastL1L2", "fullHistoryLoaded"]),
    ...mapState("settings", ["l2Settings"]),
    
    $l2Settings() {
      let l2 = this.$store.state.settings.l2
      let l2SettingsOfL2 = {};
      if (l2) {
        if (this.l2Settings && this.l2Settings[l2.code])
          l2SettingsOfL2 = this.l2Settings[l2.code];
      }
      return l2SettingsOfL2;
    },
    $generalSettings() {
      return this.$state.store.settings;
    },
    $browserLanguage() {
      if (process.browser) { 
        let code = navigator.language.replace(/-.*/, "");
        return code;
      }
      return "en";
    },
    $skin() {
      let skinInSettings
      if (typeof this.$store.state.settings.skin !== "undefined")
        skinInSettings = this.$store.state.settings.skin;
      return this.skin ? this.skin : skinInSettings ? skinInSettings : 'dark'
    },
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
    $dictionaryName() {
      return this.$store.state.settings.dictionaryName;
    },
    $dictionary() {
      return this.$getDictionary();
    },
    $hanzi() {
      return this.$getHanzi();
    },
    $lastL1L2() {
      // Find last l2 from full history
      return this.lastL1L2; // Mapped from store/fullHistory.js
    },
  },
  methods: {
    // Translate into the browser language
    $tb(text, data = {}) {
      let code = this.$l1 ? this.$l1.code : this.$browserLanguage ? this.$browserLanguage : 'en'
      if (code && this.$languages) return this.$t(text, code, data);
      else return text;
    },
    // Localize a date into the browser language
    $db(date, data = {}) {
      let code = this.$l1 ? this.$l1.code : this.$browserLanguage ? this.$browserLanguage : 'en'
      
      // options for the date format
      let options = { year: 'numeric', month: 'long', day: 'numeric' };

      // create a new Intl.DateTimeFormat with the given locale (code) and options, then format the date
      return new Intl.DateTimeFormat(code, options).format(date);
    },
  },
});
