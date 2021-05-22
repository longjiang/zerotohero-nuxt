<template>
  <div :key="'related-' + relatedKey" class="widget">
    <div class="widget-title">
      Words related to “<span v-if="!$l2.han || $l2.code === 'ja'">{{
        entry.head
      }}</span
      ><span class="traditional">{{ entry.traditional }}</span
      ><span class="simplified">{{ entry.simplified }}</span
      >”
    </div>
    <div class="jumbotron-fluid widget-body p-4">
      <WordList
        v-if="words && words.length > 0"
        :words="words"
        class="related"
        :compareWith="entry"
        collapse="10"
      />
      <div v-if="words && words.length === 0">
        Sorry, we could not find words related to “{{ entry.head }}”. You can
        set a different corpus in
        <a :href="`/${$l1.code}/${$l2.code}/settings`">Settings</a>.
      </div>
      <hr v-if="words && words.length === 0" />
      <div class="mt-4">
        {{ $t('Related words provided by') }}
        <a href="https://www.sketchengine.eu/" target="_blank">
          <img
            src="/img/logo-sketch-engine.png"
            alt="Sketch Engine"
            class="ml-2 logo-small"
          />
        </a>
      </div>
    </div>
  </div>
</template>
<script>
import SketchEngine from '@/lib/sketch-engine'
import Helper from '@/lib/helper'

export default {
  props: ['entry'],
  data() {
    return {
      Helper,
      words: undefined,
      relatedKey: 0,
    }
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
      return this.$getDictionary()
    },
    $dictionaryName() {
      return this.$store.state.settings.dictionaryName
    },
    $hanzi() {
      return this.$getHanzi()
    }
  },
  async mounted() {
    let response = await SketchEngine.thesaurus({
      l2: this.$l2,
      term: this.entry.simplified || this.entry.head,
    })
    if (response && response.Words) {
      let w = []
      for (let Word of response.Words) {
        let words =
          this.$l2.han && this.$l2.code !== 'ja'
            ? await (await this.$dictionary).lookupSimplified(Word.word)
            : [await (await this.$dictionary).lookup(Word.word)]
        if (words.length > 0 && words[0]) {
          let word = words[0]
          word.saved = this.$store.getters['savedWords/has']({
            id: word.id,
            l2: this.$l2.code,
          })
          w.push(word)
        }
      }
      this.words = w.sort((a, b) =>
        a.saved === b.saved ? 0 : a.saved ? -1 : 1
      )
      if (this.words.length > 0) {
        this.$emit('relatedReady')
      }
    }
  },
}
</script>

<style>
.related {
  list-style: none;
  padding: 0;
  columns: 2;
}

.related .saved-words.collapsed li {
  display: block;
}

.related .saved-words.collapsed li:nth-child(n + 11) {
  display: none;
}

@media (max-width: 768px) {
  .related {
    column-count: 1;
  }
}

.related.collapsed li:nth-child(n + 13) {
  display: none;
}
</style>
