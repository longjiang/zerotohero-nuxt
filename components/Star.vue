<template>
  <div class="toggle-saved-word focus-exclude">
    <button
      class="star remove-word"
      v-if="saved()"
      v-on:click="removeWordClick"
      title="Remove word"
    >
      <i class="fas fa-star"></i>
    </button>
    <button class="star add-word" v-if="!saved()" v-on:click="saveWordClick" title="Add word">
      <i class="far fa-star"></i>
    </button>
  </div>
</template>

<script>
import Helper from '@/lib/helper'

export default {
  props: {
    word: {
      type: Object
    },
    text: {
      type: String
    }
  },
  data() {
    return {
      id: Helper.uniqueId(),
      Helper
    }
  },
  methods: {
    async allForms() {
      let wordForms =
        (await (await this.$dictionary).wordForms(this.word)) || []
      wordForms = wordForms.filter(form => form !== '')
      wordForms = [this.word.bare.toLowerCase()].concat(wordForms.map(form => form.form.replace(/'/g, '')))
      if (this.text) {
        wordForms.push(this.text)
      }
      wordForms = Helper.unique(wordForms).filter(form => form && form !== '' && form !== '-')
      return wordForms
    },
    saved() {
      let saved = false
      if (this.word) {
        saved = this.$store.getters['savedWords/has']({
          id: this.word.id,
          l2: this.$l2.code
        })
      } else {
        saved = this.$store.getters['savedWords/has']({
          text: this.text.toLowerCase(),
          l2: this.$l2.code
        })
      }
      this.word.saved = saved
      return saved
    },
    async saveWordClick() {
      let wordForms = this.word ? await this.allForms() : [this.text.toLowerCase()]
      this.$store.dispatch('savedWords/add', {
        word: this.word,
        wordForms: wordForms,
        l2: this.$l2.code
      })
      this.word.saved = true
    },
    removeWordClick() {
      this.$store.dispatch('savedWords/remove', {
        word: this.word,
        l2: this.$l2.code
      })
      this.word.saved = false
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.toggle-saved-word {
  display: inline-block;
  position: relative;
  padding: 0;
  margin: 0;
  background: none;
  border: none;
  color: #ffe597;
}

.star {
  background: none;
  border: none;
  color: #f8b61e;
  padding: 0;
}
</style>
