<template>
  <div class="question-collocation" v-if="word" :id="id">
    <div class="question-slide-aspect">
      <div class="question-slide" :id="`${id}-slide-1`">
        <div class="container text-center mt-4">
          <div class="row">
            <div class="col-sm-12" v-if="loading">
              <div class="inner-circles-loader mb-4"></div>
              <div>Loading collocation information...</div>
            </div>
          </div>
        </div>
      </div>
      <div class="question-slide" :id="`${id}-slide-1`">
        <div class="container text-center mt-4" v-if="error">
          <div class="row">
            <div class="col-sm-12">
              <div>
                <i class="glyphicon glyphicon-fire mb-4"></i>
              </div>
              <div>No collocation data is available for this word.</div>
            </div>
          </div>
        </div>
        <div v-if="word.sketch && word.sketch.Gramrels">
          <div class="question-prompt mb-4">
            <div>
              <div class="question-prompt mb-4">
                An example phrase:
              </div>
              <Speak :text="phrase" class="ml-2"></Speak>
              <div
                class="text-center big-word"
                v-html="highlight(phrase, word.simplified, word.hsk)"
              ></div>
              <div
                class="example-sentence-word mt-2 simplified"
                v-html="
                  highlight(
                    gramrelNameSimplified,
                    word.simplified,
                    word.hsk
                  )
                "
              ></div>
              <div
                class="example-sentence-word mt-2 traditional"
                v-html="
                  highlight(
                    gramrelNameTraditional,
                    word.traditional,
                    word.hsk
                  )
                "
              ></div>
              <button
                class="btn-medium btn-gray mt-3"
                v-on:click="choosePhrase()"
                :data-bg-level="word.hsk"
                :data-target-selector="`#Gramrels-${type}`"
              >
                Another Example
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Helper from '@/lib/helper'
import Config from '@/lib/config'
import SketchEngine from '@/lib/sketch-engine'

export default {
  props: ['id', 'word', 'type'],
  components: {},
  data() {
    return {
      gramrel: undefined,
      phrase: undefined,
      gramrelName: undefined,
      loading: true,
      error: false
    }
  },
  async beforeMount() {
    if (this.word) {
      let sketch = await SketchEngine.wsketch(
        { term: this.word.simplified, l2: this.$l2 })
      if (sketch) {
        this.loading = false
        if (sketch.Gramrels && sketch.Gramrels.length > 0) {
          this.word.sketch = sketch
          this.word.sketch.Gramrels = this.word.sketch.Gramrels.sort(
            (a, b) => b.count - a.count
          )
          for (let gramrel of this.word.sketch.Gramrels) {
            gramrel.Words.sort((a, b) => a.cm.length - b.cm.length)
          }
          this.choosePhrase()
        } else {
          this.error = true
        }
      }
    }
  },
  methods: {
    highlight(...args) {
      return Helper.highlight(...args)
    },
    choosePhrase() {
      this.gramrel = Helper.randomArrayItem(this.word.sketch.Gramrels)
      this.phrase = Helper.randomArrayItem(this.gramrel.Words, 0, 5).cm
      this.gramrelNameSimplified = SketchEngine.collocationDescription(
        this.word.simplified
      )[this.gramrel.name]
      this.gramrelNameTraditional = SketchEngine.collocationDescription(
        this.word.traditional
      )[this.gramrel.name]
    }
  }
}
</script>
