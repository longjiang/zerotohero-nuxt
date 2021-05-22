<template>
  <div :key="'concordance-' + concordanceKey" class="widget">
    <div class="widget-title">
      {{ $t('Sentences with “{text}”', { text: term }) }}
    </div>
    <div class="widget-body jumbotron-fluid p-4">
      <div v-if="examples && examples.length > 0">
        <ul
          v-if="examples"
          class="collapsed list-unstyled"
          data-collapse-target
        >
          <li v-for="example in examples.filter(example => example.sentences.length > 0)">
            <Annotate tag="div" class="pt-2 pb-2" :showTranslate="true" :checkSaved="false">
              <span
                v-html="
                  Helper.highlightMultiple(example.sentences[0], words, level || 'outside')
                "
              />
            </Annotate>
            <div v-if="example.l1">{{ example.l1 }}</div>
            <div v-if="example.ref" class="concordance-ref">{{ example.ref }}</div>
            <hr />
          </li>
        </ul>
        <ShowMoreButton
          :length="examples.filter(example => example.sentences.length > 0).length"
          :min="7"
          :data-bg-level="level"
        />
      </div>
      <div v-if="!updating && (!examples || examples.length === 0)">
        Sorry, we could not find any “{{ term }}” examples. You can set a
        different corpus in
        <a :href="`/${$l1.code}/${$l2.code}/settings`">Settings</a>.
      </div>
      <hr v-if="examples && examples.length === 0" />
      <div class="mt-4">
        {{ $t('Sentences provided by') }}
        <a
          :href="`https://app.sketchengine.eu/#concordance?corpname=${encodeURIComponent(
            SketchEngine.corpname
          )}&tab=basic&keyword=${term}&structs=s%2Cg&refs=%3Ddoc.website&showresults=1&operations=%5B%7B%22name%22%3A%22iquery%22%2C%22arg%22%3A%22${term}%22%2C%22active%22%3Atrue%2C%22query%22%3A%7B%22queryselector%22%3A%22iqueryrow%22%2C%22iquery%22%3A%22${term}%22%7D%2C%22id%22%3A3859%7D%5D`"
          target="_blank"
        >
          <img
            src="/img/logo-sketch-engine.png"
            alt="Sketch Engine"
            class="ml-2 logo-small"
          />
        </a>
      </div>
      <hr />
      <div>
        {{ $t('Search for more sentences at') }}
        <a
          :href="`https://tatoeba.org/eng/sentences/search?from=${$l2['iso639-3']}&to=${$l1['iso639-3']}&query=${term}`"
          target="_blank"
        >
          Tatoeba
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import Helper from '@/lib/helper'
import SketchEngine from '@/lib/sketch-engine'

export default {
  props: {
    word: {
      type: Object,
    },
    text: {
      type: String,
    },
    level: {
      default: 'outside',
    },
  },
  data() {
    return {
      Helper,
      examples: undefined,
      concordanceKey: 0,
      words: [],
      SketchEngine,
      updating: false
    }
  },
  computed: {
    term() {
      return this.word ? this.word.bare : this.text
    },
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
  watch: {
    word() {
      this.update()
    },
  },
  methods: {
    async update() {
      this.updating = true
      this.examples = undefined
      let forms = this.word
        ? (await (await this.$dictionary).wordForms(this.word)).map((form) =>
            form.form.replace(/'/g, '')
          )
        : []
      this.words = [this.term].concat(forms)
      let examples = await SketchEngine.concordance({
        term: this.term,
        l1: this.$l1,
        l2: this.$l2,
      })
      for (let example of examples) {
        if (this.$l2.code === 'zh') {
          let t = example.l2.replace(/([。！？：]+”?)/g, '$1!!!DELIMITER!!!')
          let sentences = t.split('!!!DELIMITER!!!')
          example.sentences = []
          for (let sentence of sentences) {
            let found = this.words.some((word) => new RegExp(word.replace(/\*/g, '[^，。！？,!.?]+?')).test(sentence))
            if (found) {
              if (this.$l2.continua) sentence = sentence.replace(/ /g, '')
              example.sentences.push(sentence)
            }
          }
        } else {
          example.sentences = [example.l2]
        }
      }
      this.examples = examples
      this.updating = false
      if (this.examples && this.examples.length > 0) {
        this.$emit('concordanceReady')
      }
      this.concordanceKey += 1
    },
  },
  async mounted() {
    this.update()
  },
}
</script>
<style scoped>
.concordance-ref {
  color: #ccc;
  font-size: 0.8em;
}
</style>