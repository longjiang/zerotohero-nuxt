<template>
  <div class="phrase-header">
    <div class="phrase-header-pronunciation text-center">
      <Saved
        :item="phraseItem()"
        :saveText="$t('Save Phrase')"
        :removeText="$t('Saved')"
        store="savedPhrases"
        icon="bookmark"
        class="mr-2"
      />
      <Speak :text="term" ref="speak" />
    </div>
    <h2 class="phrase-header-phrase text-center font-weight-normal mt-3">
      <div class="d-inline-block">
        <Annotate :phonetics="true" :buttons="true">
          <span>{{ term }}</span>
        </Annotate>
      </div>
    </h2>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  props: {
    term: {
      type: String,
    },
  },
  computed: {
    ...mapState("settings", ["l2Settings"]),
    l2SettingsOfL2() {
      let l2SettingsOfL2 = {};
      if (this.l2Settings && this.l2Settings[this.$l2.code])
        l2SettingsOfL2 = this.l2Settings[this.$l2.code];
      return l2SettingsOfL2;
    },
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
  },
  mounted() {
    if (this.$refs.speak && this.l2SettingsOfL2.autoPronounce) {
      this.$refs.speak.speak(0.75, 0.5); // Speed and volume
    }
  },
  methods: {
    phraseItem() {
      if (typeof this.term !== "undefined") {
        let phraseItem = {
          l2: this.$l2.code,
          phrase: this.term,
        };
        return phraseItem;
      }
    },
  },
};
</script>

<style>
</style>