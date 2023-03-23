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
      <Speak :text="term" />
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
export default {
  props: {
    term: {
      type: String,
    },
  },
  computed: {
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
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