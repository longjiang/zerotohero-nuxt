import Vue from "vue";
import { mapState } from "vuex";

Vue.mixin({
  computed: {
    ...mapState("settings", ["l2Settings"]),
    $l2SettingsOfL2() {
      let l2SettingsOfL2 = {};
      if (this.l2) {
        if (this.l2Settings && this.l2Settings[this.l2.code])
          l2SettingsOfL2 = this.l2Settings[this.l2.code];
      }
      return l2SettingsOfL2;
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
    $hanzi() {
      return this.$getHanzi();
    },
  },
});
