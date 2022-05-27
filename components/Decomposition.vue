<template>
  <div class="decomposition" :id="id" @click="showAnswer"></div>
</template>

<script>
const decompositionTemplate = {
  '⿰': `<div class="description description-⿰">
    <div class="part part-⿰-1"></div>
    <div class="part part-⿰-2"></div>
  </div>`,
  '⿱': `<div class="description description-⿱">
    <div class="part part-⿱-1"></div>
    <div class="part part-⿱-2"></div>
  </div>`,
  '⿲': `<div class="description description-⿲">
    <div class="part part-⿲-1"></div>
    <div class="part part-⿲-2"></div>
    <div class="part part-⿲-3"></div>
  </div>`,
  '⿳': `<div class="description description-⿳">
    <div class="part part-⿳-1"></div>
    <div class="part part-⿳-2"></div>
    <div class="part part-⿳-3"></div>
  </div>`,
  '⿹': `<div class="description description-⿹">
    <div class="part part-⿹-1"></div>
    <div class="part part-⿹-2"></div>
  </div>`,
  '⿸': `<div class="description description-⿸">
    <div class="part part-⿸-1"></div>
    <div class="part part-⿸-2"></div>
  </div>`,
  '⿺': `<div class="description description-⿺">
    <div class="part part-⿺-1"></div>
    <div class="part part-⿺-2"></div>
  </div>`,
  '⿵': `<div class="description description-⿵">
    <div class="part part-⿵-1"></div>
    <div class="part part-⿵-2"></div>
  </div>`,
  '⿶': `<div class="description description-⿶">
    <div class="part part-⿶-1"></div>
    <div class="part part-⿶-2"></div>
  </div>`,
  '⿷': `<div class="description description-⿷">
    <div class="part part-⿷-1"></div>
    <div class="part part-⿷-2"></div>
  </div>`,
  '⿴': `<div class="description description-⿴">
    <div class="part part-⿴-1"></div>
    <div class="part part-⿴-2"></div>
  </div>`,
  '⿻': `<div class="description description-⿻">
    <div class="part part-⿻-1"></div>
    <div class="part part-⿻-2"></div>
  </div>`
}

import Helper from '@/lib/helper'

export default {
  props: ['char', 'quiz'],
  data() {
    return {
      id: 'decomposition-' + Helper.uniqueId()
    }
  },
  mounted() {
    this.drawDecomposition(this.char, '#' + this.id)
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
      return this.$getDictionary();
    },
    $dictionaryName() {
      return this.$store.state.settings.dictionaryName;
    },
    $hanzi() {
      return this.$getHanzi();
    },
  },
  methods: {
    showAnswer() {
      if (this.quiz) {
        $(`#${this.id}`).toggleClass('show-answer')
      } 
    },
    async drawDecomposition(char, selector) {
      const character = (await this.$getHanzi()).lookup(char)
      if (!character) return
      await character.walkDecompositionTree(async node => {
        if (character.isIdeographicDescCharacter(node.character)) {
          if (node.parent) {
            node.selector = `${node.parent.selector} > .description-${
              node.parent.character
            } > .part-${node.parent.character}-${node.index + 1}`
          } else {
            node.selector = `${selector}`
          }
          const $template = $(decompositionTemplate[node.character])
          $(node.selector).append($template)
        } else {
          let $template
          if (node.character === '？') {
            $template = $(`<div class="part-pinyin">(other elements)</div>`)
          } else {
            const childCharacter = (await this.$getHanzi()).lookupShallow(
              node.character
            )
            $template = $(`
            <div class="part-pinyin part-pinyin-${node.character}">${childCharacter.pinyin}</div>
            <div class="part-character part-character-${node.character}">${childCharacter.character}</div>`)
          }
          if (node.parent) {
            node.selector = `${node.parent.selector} > .description-${
              node.parent.character
            } > .part-${node.parent.character}-${node.index + 1}`
          } else {
            node.selector = `${selector}`
          }
          if (node) {
            $(node.selector).append($template)
          }
        }
      })
      if (this.quiz) {
        let $characters = $(selector).find('.part-character')
        let character =
          $characters[Math.floor(Math.random() * $characters.length)]
        $(character)
          .parent()
          .addClass('hide')
      }
    }
  }
}
</script>

<style scoped>
.decomposition-before,
.decomposition-after {
  font-size: 3rem;
  line-height: 8rem;
  padding: 1rem;
  font-weight: bold;
}

.decomposition-word {
  display: flex;
  flex-direction: row;
}

.decomposition > .part-pinyin {
  border: 2px dashed #ccc;
  width: 10rem;
  height: 10rem;
  display: flex;
  justify-content: center;
  align-items: center;
}
.description {
  width: 10rem;
  height: 10rem;
  display: flex;
  position: relative;
  max-width: 100%;
  max-height: 100%;
}

.description-⿰ {
  flex-direction: row;
}

.description-⿱ {
  flex-direction: column;
}

.decomposition .part {
  border: 1px dashed #ccc;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.description-⿳ {
  flex-direction: column;
}

.decomposition .part-⿹-2 {
  position: absolute;
  height: 50%;
  width: 50%;
  bottom: 0;
  left: 0;
}

.decomposition .part-⿸-2 {
  position: absolute;
  height: 50%;
  width: 50%;
  bottom: 0;
  right: 0;
}

.decomposition .part-⿺-2 {
  position: absolute;
  height: 50%;
  width: 50%;
  top: 0;
  right: 0;
}

.decomposition .part-⿵-2 {
  position: absolute;
  width: 60%;
  height: 65%;
  bottom: 0;
  left: 20%;
}

.decomposition .part-⿶-2 {
  position: absolute;
  width: 40%;
  height: 50%;
  top: 0;
  left: 30%;
}

.decomposition .part.part-⿷-2 {
  position: absolute;
  width: 50%;
  height: 40%;
  top: 30%;
  right: 0;
}

.decomposition .part-⿴-2 {
  position: absolute;
  width: 40%;
  height: 40%;
  top: 43%;
  left: 30%;
}

.decomposition .part-⿻-1 {
  width: 66.67%;
  height: 66.67%;
  top: 0;
  left: 0;
  position: absolute;
}

.decomposition .part-⿻-2 {
  width: 66.67%;
  height: 66.67%;
  right: 0;
  bottom: 0;
  position: absolute;
}

.part-character {
  font-weight: bold;
  font-size: 1.2em;
}

.part-pinyin {
  font-size: 0.8em;
}

.part-⿷-1 {
  padding-right: 50%;
}

.part-⿹-1 {
  padding: 0 0 40% 40%;
}

.part-⿸-1 {
  padding: 0 40% 40% 0;
}

.part-⿺-1 {
  padding: 40% 40% 0 0;
}

.part-⿵-1 {
  padding-bottom: 60%;
}

.part-⿶-1 {
  padding-top: 40%;
}

.part-⿴-1 {
  padding-bottom: 54%;
}

.part-⿻-1 {
  padding: 0 15%;
}

.decomposition .part-⿻-3 {
  background: #e4d9d9;
  width: 33.33%;
  height: 33.33%;
  position: absolute;
  top: 33.33%;
  left: 33.33%;
}

.decomposition {
  display: inline-block;
}

.stroke-decomposition {
  display: block;
  width: 10rem;
  margin: 0 auto;
}

.description-⿳ .part-⿱-1,
.description-⿳ .part-⿱-2 {
  display: flex;
  flex-direction: row-reverse;
}

.description-⿳ .part-⿱-1 .part-character,
.description-⿳ .part-⿱-2 .part-character {
  display: flex;
  flex-direction: row-reverse;
  margin-right: 0.5rem;
}
</style>
