<template>
  <div>
    <ul :class="classes" data-collapse-target>
      <WordListItem
        v-for="(word, index) in asyncComputedWords"
        :key="`word-list-word-${index}-${word.id}`"
        :word="word"
        :index="index"
        :star="star"
        :showSpeak="showSpeak"
        :hideWord="hideWord"
        :hidePhonetics="hidePhonetics"
        :hideDefinitions="hideDefinitions"
        :compareWith="compareWith"
        :removeSymbol="removeSymbol"
        class="grid-row"
        />
    </ul>
    <ShowMoreButton
      v-if="collapse > 0 && asyncComputedWords?.length > collapse"
      class="mt-2 d-block w-100"
      :length="asyncComputedWords?.length"
      :min="collapse"
    />
  </div>
</template>
<script>
import { uniqueByValue } from "@/lib/utils";

export default {
  props: {
    words: {
      type: Array,
    },
    ids: {
      type: Array,
    },
    star: {
      default: true,
    },
    hideWord: {
      default: false,
    },
    hideDefinitions: {
      default: false,
    },
    hidePhonetics: {
      default: false,
    },
    showSpeak: {
      default: true,
    },
    collapse: {
      default: false,
    },
    removeSymbol: {
      default: false,
    },
    compareWith: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    classes() {
      return {
        wordlist: true,
        "list-unstyled mb-0": true,
        'grid-container': true,
        'collapsed': this.collapse > 0,
        [`collapse-${this.collapse}`]: this.collapse > 0,
      };
    },
  },
  asyncComputed: {
    async asyncComputedWords() {
      let allWords = []
      let dictionary = await this.$getDictionary();
      if (this.words) allWords = this.words
      
      if (this.ids) {
        let wordFromIds = await Promise.all(
          this.ids.map(async (id) => {
            return await dictionary.get(id);
          })
        );
        wordFromIds = wordFromIds?.filter((w) => w) || []
        allWords = allWords.concat(wordFromIds)
      }

      // Transliterate to Romaji if Japanese
      if (this.$l2.code === "ja") {
        allWords = await Promise.all(
          allWords.map(async (word) => {
            word.romaji = await dictionary.transliterate(word?.kana);
            return word;
          })
        );
      }
      allWords = uniqueByValue(allWords, "id");
      return allWords;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/variables.scss";

.grid-container {
    display: grid;
    gap: 10px; /* space between rows */
}

.grid-row {
    display: grid;
    grid-template-columns: auto 1fr; /* first column size according to content, second takes the rest */
}

.col1 {
    display: grid;
    grid-template-columns: auto auto auto; /* each sub-column only as wide as necessary */
}

.col2 {

}


</style>
