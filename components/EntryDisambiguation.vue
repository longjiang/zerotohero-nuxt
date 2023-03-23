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
  computed: {
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
    $dictionary() {
      return this.$getDictionary();
    },
    $dictionaryName() {
      return this.$store.state.settings.dictionaryName;
    },
  },
  methods: {
    async getOtherPronunciations() {
      let similarWords = [];
      let words = ["zh", "yue"].includes(this.$l2.code)
        ? await (
            await this.$getDictionary()
          ).lookupSimplified(this.entry.simplified)
        : await (await this.$getDictionary()).lookupMultiple(this.entry.head);
      for (let word of words) {
        if (word.id !== this.entry.id) {
          similarWords.push(word);
        }
      }
      return similarWords;
    },
    async getReverse() {
      const reverse = this.entry.simplified.split("").reverse().join("");
      let words = await (await this.$getDictionary()).lookupSimplified(reverse);
      for (let word of words) {
        this.similarWords.push(word);
      }
    },
    async getSimilarWords() {
      for (let definition of this.entry.definitions) {
        let words = await (await this.$getDictionary()).lookupByDef(definition);
        for (let word of words) {
          if (word.id !== this.entry.id) {
            this.similarWords.push(word);
          }
        }
      }
    },
    async getHomonyms() {
      let words = await (
        await this.$getDictionary()
      ).lookupPinyinFuzzy(
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
