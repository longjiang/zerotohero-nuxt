<template>
  <Widget v-if="similarWords.length > 0">
    <template #title>{{ $t("Compare with") }}</template>
    <template #body>
      <WordList
        collapse="5"
        :words="similarWords"
        :compareWith="entry"
        :key="wordsKey"
        :traditional="entry.simplified && entry.simplified.length === 1"
      ></WordList>
    </template>
  </Widget>
</template>

<script>
export default {
  props: ["entry"],
  mounted() {
    if (this.entry.simplified && this.entry.simplified.length > 1) {
      this.getReverse();
      this.getHomonyms();
    } else {
      this.similarWords = this.getOtherPronunciations();
    }
    // this.getSimilarWords()
  },
  watch: {
    similarWords() {
      this.wordsKey++;
    },
  },
  data() {
    return {
      wordsKey: 0,
      similarWords: [],
    };
  },
  methods: {
    async getOtherPronunciations() {
      let similarWords = [];
      const dictionary = await this.$getDictionary();
      let words = ["zh", "yue"].includes(this.$l2.code)
        ? await dictionary.lookupSimplified(this.entry.simplified)
        : await dictionary.lookupMultiple(this.entry.head);
      for (let word of words) {
        if (word.id !== this.entry.id) {
          similarWords.push(word);
        }
      }
      return similarWords;
    },
    async getReverse() {
      const reverse = this.entry.simplified.split("").reverse().join("");
      const dictionary = await this.$getDictionary();
      let words = await dictionary.lookupSimplified(reverse);
      for (let word of words) {
        this.similarWords.push(word);
      }
    },
    async getSimilarWords() {
      const dictionary = await this.$getDictionary();
      for (let definition of this.entry.definitions) {
        let words = await dictionary.lookupByDef(definition);
        for (let word of words) {
          if (word.id !== this.entry.id) {
            this.similarWords.push(word);
          }
        }
      }
    },
    async getHomonyms() {
      const dictionary = await this.$getDictionary();
      let words = await dictionary.lookupByPronunciation(
        this.entry.cjk ? this.entry.cjk.phonetics : this.entry.pinyin
      );
      for (let word of words) {
        if (word.id !== this.entry.id) {
          this.similarWords.push(word);
        }
      }
    },
  },
};
</script>
