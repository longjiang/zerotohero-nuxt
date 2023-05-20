<template>
  <div
    :dir="
      foreign &&
      $l2.scripts &&
      $l2.scripts.length > 0 &&
      $l2.scripts[0].direction === 'rtl'
        ? 'rtl'
        : 'ltr'
    "
    :class="{
      annotated: true,
      'add-pinyin': true,
      'text-right':
        foreign &&
        $l2.scripts &&
        $l2.scripts.length > 0 &&
        $l2.scripts[0].direction === 'rtl'
    }"
  >
    <table class="study-sheet-table" id="description">
      <tbody>
        <tr v-for="(line, index) in textLines" v-bind:key="line">
          <td class="study-sheet-td-translation">
            <span v-html="translationLines[index]" />
          </td>
          <td></td>
          <td class="study-sheet-td-text">
            <template v-if="line.trim().length > 0">
              <span v-if="!annotated" v-html="line.trim()"></span>
              <span v-html="annotatedLines[index]" />
            </template>
          </td>
          <td></td>
          <td class="study-sheet-td-definition">
            <template v-if="line.trim().length > 0">
              <v-runtime-template
                v-if="annotated"
                :template="`<span>${dictionaryTemplateLines[index]}</span>`"
              />
            </template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import WordBlock from '@/components/WordBlock'
import WordBlockDictionary from '@/components/WordBlockDictionary'
import VRuntimeTemplate from 'v-runtime-template'
import { reject, splitByReg } from '@/lib/utils'

export default {
  components: {
    WordBlock,
    WordBlockDictionary,
    VRuntimeTemplate
  },
  props: {
    foreign: {
      default: true
    },
    text: {
      default: ''
    },
    translation: {
      default: ''
    },
    targetLevel: {
      default: 1
    }
  },
  data() {
    return {
      annotated: false,
      annotatedLines: [],
      dictionaryTemplateLines: [],
      batchId: 0,
      tokenized: [],
      phrases: [],
      seen: []
    }
  },
  computed: {
    textLines() {
      return this.text
        .trim()
        .split('\n')
    },
    translationLines() {
      return this.translation
        .trim()
        .split('\n')
    }
  },
  async mounted() {
    if (!this.annotated) {
      if (this.$hasFeature('dictionary') || this.nonLatin()) {
        await this.annotate()
        this.annotated = true
      }
    }
  },
  methods: {
    nonLatin() {
      var rforeign = /[^\u0000-\u007f]/
      let nonLatin = rforeign.test(this.text)
      return nonLatin
    },
    async annotate() {
      if (this.$dictionaryName === 'ecdict') {
        const dictionary = await this.$getDictionary();
        await dictionary.addFrequencyToPhrases()
      }
      if (this.text) {
        for (let line of this.textLines) {
          let tokenized = await this.tokenize(line, this.batchId++)
          let annotatedLine = tokenized.annotatedHtml
          let dictionaryTemplateLine = tokenized.dictionaryTemplate
          this.annotatedLines.push(annotatedLine)
          this.dictionaryTemplateLines.push(dictionaryTemplateLine)
        }
      }
    },
    async tokenize(text, batchId) {
      let annotatedHtml = text
      let dictionaryTemplate = text
      if (this.$l2.continua) {
        annotatedHtml = ''
        dictionaryTemplate = ''
        const dictionary = await this.$getDictionary();
        let tokenized = await dictionary.tokenizeWithCache(text)
        this.tokenized[batchId] = tokenized
        for (let index = 0; index < this.tokenized[batchId].length; index++) {
          let item = this.tokenized[batchId][index]
          if (typeof item === 'object') {
            let seen = this.seen.includes(item.text)
            if (!seen) this.seen.push(item.text)
            let common = item && item.candidates && item.candidates.length > 0 && item.candidates[0].weight && item.candidates[0].weight > 750
            annotatedHtml += `<span sticky="true" class="word-block sticky${seen ? ' seen' : ''}${common ? ' common' : ''}" data-hover-level="${item.candidates[0].level}" ><span class="word-block-simplified">${item.candidates[0].simplified}</span></span>`
            dictionaryTemplate += `<WordBlockDictionary :sticky="true" :token="tokenized[${batchId}][${index}]" :seen="${seen}" />`
          } else {
            if (item !== '') {
              annotatedHtml += `<span class="word-block""><span class="word-block-text">${item}</span></span>`
              annotatedHtml = annotatedHtml.trim()
            }
          }
        }
      } else {
        annotatedHtml = ''
        dictionaryTemplate = ''
        text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents e.g. résumé -> resume
        this.tokenized[batchId] = []
        let segs = splitByReg(text, /([a-zA-Z0-9]+)/gi)
        var lemmatizer = new Lemmatizer()
        for (let seg of segs) {
          let word = seg.toLowerCase()
          if (/.*([a-z0-9]+).*/.test(word) && (!reject[this.$l2.code] || !reject[this.$l2.code].includes(word))) {
            let lemmas = lemmatizer.lemmas(word)
            lemmas = [[word, 'inflected']].concat(lemmas)
            let found = false
            for (let lemma of lemmas) {
              const dictionary = await this.$getDictionary();
              let candidates = await dictionary.lookupMultiple(lemma[0])
              if (candidates.length > 0) {
                let token = {
                  text: seg,
                  candidates
                }
                this.tokenized[batchId].push(token)
                found = true
                break
              }
            }
            if (!found) {
              this.tokenized[batchId].push(seg)
            }
          } else {
            this.tokenized[batchId].push(seg)
          }
        }
        for (let index = 0; index < this.tokenized[batchId].length; index++) {
          let item = this.tokenized[batchId][index]
          if (typeof item === 'object') {
            let text = item.text.toLowerCase()
            let seen = this.seen.includes(text)
            if (!seen) this.seen.push(text)
            annotatedHtml += `<span data-level="${this.tokenized[batchId][index].candidates[0].level}" data-rank="${this.tokenized[batchId][index].candidates[0].rank}" class="word-block sticky${seen ? ' seen' : ''}">${this.tokenized[batchId][index].text}</span>`
            dictionaryTemplate += `<WordBlockDictionary :sticky="true" :token="tokenized[${batchId}][${index}]" :seen="${seen}"/>`
          } else {
            annotatedHtml += `<span>${item}</span>`
          }
        }
        const dictionary = await this.$getDictionary();
        let phrases = await dictionary.findPhrases(text)
        this.phrases[batchId] = phrases
        for (let index = 0; index < this.phrases[batchId].length; index++) {
          let phrase = this.phrases[batchId][index]
          let seen = this.seen.includes(phrase.word)
          if (!seen) this.seen.push(phrase.word)
          dictionaryTemplate += `<WordBlockDictionary :sticky="true" :token="{text: phrases[${batchId}][${index}].word, candidates: [phrases[${batchId}][${index}]]}" :seen="${seen}"/>`
        }
      }
      return {
        annotatedHtml: annotatedHtml.replace(/<span> <\/span>/g, ' '),
        dictionaryTemplate
      }
    },
  }
}
</script>

<style lang="scss" scoped>


.study-sheet-table {
  position: relative;
}
.study-sheet-td-translation,
.study-sheet-td-text {
  min-width: 20vw;
}

.show-pinyin .study-sheet-table .word-block .word-block-pinyin,
.show-simplified .study-sheet-table .word-block .word-block-simplified,
.show-traditional .study-sheet-table .word-block .word-block-traditional,
.show-definition .study-sheet-table .word-block .word-block-definition {
  display: inline;
}

.add-pinyin .study-sheet-table .word-block .word-block-text {
  display: inline;
}

.study-sheet-td-translation {
  padding: 4px;
  vertical-align: top;
  padding-right: 21px;
  color: #8fa9c1;
  line-height: 14px;
}

.study-sheet-table .study-sheet-td-text {
  padding: 8px;
  vertical-align: top;
  padding-right: 21px;
  line-height: 1.5;
}

.study-sheet-table .study-sheet-td-text span {
  color: black !important;
}

.study-sheet-td-definition {
  padding: 4px;
  vertical-align: top;
  line-height: 14px;
}

.study-sheet-table .study-sheet-td-definition span {
  color: #757171 !important;
}

.study-sheet-td-translation span {
  font-size: 8px;
  font-family: "Adobe Text Pro", serif;
  font-display: swap;
}

.study-sheet-td-text span {
  font-size: 11px;
  font-family: "Adobe Text Pro", serif;
  font-display: swap;
}

.l2-zh .study-sheet-td-text span {
  font-family: "Source Han Serif SC", serif;
  font-display: swap;
}

.study-sheet-td-definition span {
  font-size: 8px;
}

.l1-zh .study-sheet-td-definition span {
  font-family: "Source Han Serif SC", serif;
  font-display: swap;
}

.l2-zh .study-sheet-td-definition span {
  font-family: "Adobe Text Pro", serif;
  font-display: swap;
}

.study-sheet-td-definition span .word-block-dictionary-simplified {
  font-family: "Adobe Text Pro", serif;
  font-display: swap;
}

.l2-zh .study-sheet-td-definition span .word-block-dictionary-simplified {
  font-family: "Source Han Serif SC", serif;
  font-display: swap;
}

.study-sheet-td-definition span .word-block-dictionary-phonetic {
  font-family: "gentium plus";
  font-display: swap;
}

/* for the text column */
.show-level-1 .study-sheet-table [data-hover-level="1"].sticky:not(.seen) span,
.show-level-2 .study-sheet-table [data-hover-level="2"].sticky:not(.seen) span,
.show-level-3 .study-sheet-table [data-hover-level="3"].sticky:not(.seen) span,
.show-level-4 .study-sheet-table [data-hover-level="4"].sticky:not(.seen) span,
.show-level-5 .study-sheet-table [data-hover-level="5"].sticky:not(.seen) span,
.show-level-6 .study-sheet-table [data-hover-level="6"].sticky:not(.seen) span,
.show-level-outside
  .study-sheet-table
  [data-hover-level="outside"].sticky:not(.seen):not(.common)
  span {
  color: #b74900 !important;
}

/* for the definition column */
.show-level-1 .study-sheet-table [data-level="1"]:not(.seen),
.show-level-2 .study-sheet-table [data-level="2"]:not(.seen),
.show-level-3 .study-sheet-table [data-level="3"]:not(.seen),
.show-level-4 .study-sheet-table [data-level="4"]:not(.seen),
.show-level-5 .study-sheet-table [data-level="5"]:not(.seen),
.show-level-6 .study-sheet-table [data-level="6"]:not(.seen),
.show-level-outside
  .study-sheet-table
  [data-level="outside"]:not(.seen):not(.common) {
  color: #b74900 !important;
}

/* for the text column */
.show-level-1 .study-sheet-table [data-hover-level="PreA1"].sticky:not(.seen),
.show-level-1 .study-sheet-table [data-hover-level="Pre-A1"].sticky:not(.seen),
.show-level-2 .study-sheet-table [data-hover-level="A1"].sticky:not(.seen),
.show-level-3 .study-sheet-table [data-hover-level="A2"].sticky:not(.seen),
.show-level-4 .study-sheet-table [data-hover-level="B1"].sticky:not(.seen),
.show-level-5 .study-sheet-table [data-hover-level="B2"].sticky:not(.seen),
.show-level-6 .study-sheet-table [data-hover-level="C1"].sticky:not(.seen),
.show-level-outside
  .study-sheet-table
  [data-hover-level="C2"].sticky:not(.seen):not(.common) {
  color: #b74900 !important;
}

/* for the definition column */
.show-level-1 .study-sheet-table [data-level="PreA1"]:not(.seen),
.show-level-1 .study-sheet-table [data-level="Pre-A1"]:not(.seen),
.show-level-2 .study-sheet-table [data-level="A1"]:not(.seen),
.show-level-3 .study-sheet-table [data-level="A2"]:not(.seen),
.show-level-4 .study-sheet-table [data-level="B1"]:not(.seen),
.show-level-5 .study-sheet-table [data-level="B2"]:not(.seen),
.show-level-6 .study-sheet-table [data-level="C1"]:not(.seen),
.show-level-outside
  .study-sheet-table
  [data-level="C2"]:not(.seen):not(.common):not(.low-rank) {
  color: #b74900 !important;
}
</style>
