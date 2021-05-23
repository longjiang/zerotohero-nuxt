<router>
  {
    path: '/:l1/:l2/explore/related/:arg?',
    meta: {
      title: 'Related Words | Zero to Hero',
      metaTags: [
        {
          name: 'description',
          content: 'For any given word, find words related ot it.'
        }
      ]
    }
  }
</router>
<template>
  <div class="main mt-4 mb-4">
    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <div>
            <h4>Explore Related Words</h4>
            <p>Search for a word, and see words associated with it.</p>
            <Search :hrefFunc="hrefFunc" class="mb-4" ref="search" />
          </div>
          <Loader class="mt-5" />
          <div v-if="arg">
            <div v-if="related && related.length > 1">
              <h4 class="text-center mt-5">
                Words related to “
                <span class="simplified">
                  {{
                  word.simplified
                  }}
                </span>
                <span class="traditional">{{ word.traditional }}</span>”
              </h4>
              <Merge direction="bottom" class="h-half mt-5 mb-5" />
              <Loader class="mt-5" />
              <div>
                <WordListExtended class="focus" :words="related.slice(0, 30)" :compareWith="word" />
              </div>
              <h4 v-if="related.length > 30" class="text-center mb-5">More Related Words</h4>
              <WordList
                v-if="related.length > 30"
                :compareWith="word"
                :words="related.slice(30)"
                class="related mb-5"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Helper from '@/lib/helper'
import WordListExtended from '@/components/WordListExtended.vue'
import Search from '@/components/Search.vue'
import SketchEngine from '@/lib/sketch-engine'
import Merge from '@/components/Merge'

export default {
  components: {
    WordListExtended,
    Merge,
    Search
  },
  beforeMount() {
    this.route()
  },
  data() {
    return {
      Helper,
      word: undefined,
      arg: undefined,
      related: [],
      hrefFunc: entry => `/${this.$l1.code}/${this.$l2.code}/explore/related/${entry.id}`
    }
  },
  methods: {
    async route() {
      if (this.$route.params.arg) {
        this.word = undefined
        this.related = []
        this.arg = this.$route.params.arg
        let word = await (await this.$getDictionary()).get(this.arg)
        document.title = `Words Related to ${word.simplified} (${word.pinyin}) ${word.definitions[0].text}`
        this.word = word
        this.$refs.search.dEntry = word
        this.$refs.search.text = word.simplified
        this.related = [this.word]
        let response = await SketchEngine.thesaurus({
          l2: this.$l2,
          term: this.word.simplified
        })
        this.words = []
        if (response) {
          for (let Word of response.Words) {
            let words = await (await this.$getDictionary()).lookupSimplified(
              Word.word
            )
            if (words.length > 0) {
              let word = words[0]
              this.related.push(word)
            }
            this.related = this.related.sort((a, b) => {
              let ahsk = a.hsk === 'outside' ? 7 : parseInt(a.hsk)
              let bhsk = b.hsk === 'outside' ? 7 : parseInt(b.hsk)
              return ahsk - bhsk
            })
          }
        }
      } else {
        this.arg = ''
      }
    }
  },
  watch: {
    $route() {
      if (this.$route.name === 'explore-related') {
        this.route()
      }
    }
  }
}
</script>
