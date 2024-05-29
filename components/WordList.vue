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
import { unique, uniqueByValue } from "@/lib/utils";

export default {
  props: {
    words: {
      type: Array,
    },
    ids: {
      type: Array,
    },
    matchedWords: {
      default: undefined,
    },
    compareWith: {
      default: false,
    },
    traditional: {
      default: false,
    },
    highlight: {
      default: false,
    },
    collapse: {
      default: 0,
    },
    star: {
      default: true,
    },
    level: {
      default: false,
    },
    url: {
      type: Function,
    },
    skin: {
      default: null,
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
    showCounters: {
      default: true,
    },
    maxDefinitions: undefined,
    removeSymbol: {
      default: false,
    },
    showSpeak: {
      default: true,
    },
  },
  computed: {
    classes() {
      let classes = {
        wordlist: true,
        "list-unstyled": true,
        'grid-container': true,
        collapsed: this.collapse > 0,
      };
      classes[`collapse-${this.collapse}`] = true;
      classes[`skin-${this.$skin}`] = true;
      return classes;
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
  methods: {
    filterDefinitions(word) {
      if (!word.definitions) return;
      let definitions = word.definitions;
      if (this.$l2.code === "zh")
        definitions = definitions.filter((def) => !def.startsWith("CL"));
      definitions = unique(definitions);
      if (this.maxDefinitions)
        definitions = definitions.slice(0, this.maxDefinitions);
      return definitions;
    },
    unique(list) {
      return unique(list);
    },
    getUrl(word, index) {
      if (!word) return;
      if (this.url) return this.url(word, index);
      else
        return `/${this.$l1.code}/${this.$l2.code}/dictionary/${this.$dictionaryName}/${word.id}`;
    },
    getLevel(word) {
      if (this.$l2.code === "zh" && word) {
        if (word.newHSK && word.newHSK === "7-9") {
          return "7-9";
        } else if (word.hsk !== "outside") {
          return word.hsk;
        } else if (word.hsk === "outside" && word.weight < 750) {
          return "outside";
        } else {
          return false;
        }
      } else {
        return word.level || "outside";
      }
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
