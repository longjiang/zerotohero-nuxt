<template>
  <div v-if="similarWords.length > 0" class="widget">
    <div class="widget-title">Compare with</div>
    <div class="widget-body jumbotron-fluid p-4">
      <WordList
        collapse="5"
        :words="similarWords"
        :compareWith="entry"
        :key="wordsKey"
        :traditional="entry.simplified && entry.simplified.length === 1"
      ></WordList>
    </div>
  </div>
</template>

<script>

export default {
  props: ['entry'],
  mounted() {
    if (this.entry.simplified && this.entry.simplified.length > 1) {
      this.getReverse()
      this.getHomonyms()
    } else {
      this.getOtherPronunciations()
    }
    // this.getSimilarWords()
  },
  watch: {
    similarWords() {
      this.wordsKey++
    }
  },
  data() {
    return {
      wordsKey: 0,
      similarWords: []
    }
  },
  methods: {
    async getOtherPronunciations() {
      let words = this.$l2.code === 'zh' ? await (await this.$dictionary).lookupSimplified(this.entry.simplified) : await (await this.$dictionary).lookup(this.entry.bare)
      for (let word of words) {
        if (word.id !== this.entry.id) {
          this.similarWords.push(word)
        }
      }
    },
    async getReverse() {
      const reverse = this.entry.simplified
        .split('')
        .reverse()
        .join('')
      let words = await (await this.$dictionary).lookupSimplified(reverse)
      for (let word of words) {
        this.similarWords.push(word)
      }
    },
    async getSimilarWords() {
      for (let definition of this.entry.definitions) {
        let words = await (await this.$dictionary).lookupByDef(definition)
        for (let word of words) {
          if (word.id !== this.entry.id) {
            this.similarWords.push(word)
          }
        }
      }
    },
    async getHomonyms() {
      let words = await (await this.$dictionary).lookupPinyinFuzzy(this.entry.pinyin)
      for (let word of words) {
        if (word.id !== this.entry.id) {
          this.similarWords.push(word)
        }
      }
    }
  }
}
</script>
