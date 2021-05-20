<template>
  <div>
    <h6>{{ $t(title, { word: term }).replace(/{word}/g, term) }}</h6>
    <hr class="mt-0 mb-2" />
    <div v-if="collocation">
      <ul
        class="collapsed gramrel pl-0 mb-0"
        data-collapse-target
        :key="collocation - { title } - { term }"
      >
        <li
          v-for="(line, index) in lines"
          class="gramrel-item list-unstyled"
          :key="`${term}-collocation-${type}-${index}`"
        >
          <SmallStar
            :item="line"
            :saved="line => line.saved"
            :save="saveLine"
            :remove="removeSavedLine"
            style="overflow: hidden"
          />
          <Annotate tag="span" :checkSaved="false">
            <span
              v-html="Helper.highlight(line.line, word ? word.bare : text, level)"
            />
          </Annotate>
        </li>
      </ul>
      <ShowMoreButton
        :data-bg-level="level"
        :length="collocation.Words.length"
        :min="4"
      />
    </div>
    <div v-else>–</div>
  </div>
</template>

<script>
import Helper from '@/lib/helper'
import { mapState } from 'vuex'

export default {
  props: {
    word: {
      type: Object,
    },
    text: {
      type: String,
    },
    level: {
      type: String,
    },
    type: {
      type: String,
    },
    title: {
      type: String,
    },
    collocation: {
      type: Object,
    },
  },
  data() {
    return {
      Helper,
      lines: [],
    }
  },
  computed: {
    ...mapState('savedCollocations', ['savedCollocations']),
    sC() {
      return this.savedCollocations[this.$l2.code]
        .filter((collocation) => collocation.term === this.term)
        .map((collocation) => {
          collocation.saved = true
          return collocation
        })
    },
    term() {
      return this.word ? this.word.bare : this.text
    },
  },
  watch: {
    collocation() {
      this.update()
    },
    word() {
      this.update()
    },
    text() {
      this.update()
    },
  },
  beforeMount() {
    this.update()
  },
  methods: {
    saveLine(line) {
      this.$store.dispatch('savedCollocations/add', {
        term: this.term,
        line: line.line,
        l2: this.$l2.code,
      })
      line.saved = true
    },
    removeSavedLine(line) {
      this.$store.dispatch('savedCollocations/remove', {
        term: this.term,
        line: line.line,
        l2: this.$l2.code,
      })
      line.saved = false
    },
    update() {
      this.lines = []
      if (this.collocation && this.collocation.Words) {
        let words = this.collocation.Words.filter((Word) => Word.cm).filter(
          (Word) => !Word.cm.match(/[。？，→]/)
        )
        words = Helper.uniqueByValue(words, 'cm').sort(
          (a, b) => a.cm.length - b.cm.length
        )
        this.collocation.Words = words.slice(0, 20)
        let lines = []
        for (let Word of this.collocation.Words) {
          if (Word.cm) {
            lines.push({
              line: Word.cm,
              saved: this.sC.find(line => line.line === Word.cm)
            })
          }
        }
        this.lines = lines
      }
    },
  },
}
</script>
