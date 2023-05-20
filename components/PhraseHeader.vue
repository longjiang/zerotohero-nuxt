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
        <Annotate :buttons="true">
          <span>{{ term }}</span>
        </Annotate>
      </div>
    </h2>
  </div>
</template>

<script>
export default {
  props: {
    term: {
      type: String,
    },
  },
  mounted() {
    if (this.$refs.speak && this.$l2Settings.autoPronounce) {
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