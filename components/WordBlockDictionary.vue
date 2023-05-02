<template>
  <span
    :class="{
      'word-block-dictionary': true,
      common: token && token.candidates && token.candidates.length > 0 && token.candidates[0].weight && token.candidates[0].weight > 750,
      seen: seen
    }"
    v-if="token && token.candidates && token.candidates.length > 0 && !seen"
    :data-level="token.candidates[0].level"
    :data-rank="token.candidates[0].rank"
  >
    <a
      class="word-block-dictionary-simplified"
      target="_blank"
      :href="this.$l2.code === 'zh' ? `plecoapi://x-callback-url/s?q=${token.candidates[0].simplified}` : this.$l2.code === 'en' ? `https://dictionary.cambridge.org/dictionary/english-chinese-simplified/${token.candidates[0].head}` : undefined"
      :data-level="token.candidates[0].level"
      >{{ token.candidates[0].head }}</a
    >
    <span v-if="this.$l2.code === 'zh'"
      class="word-block-dictionary-phonetic"
      @click="cycleCandidate"
      :data-level="token.candidates[0].level">
      ({{ token.candidates[candidateIndex].pinyin }})
    </span>
    <span
      class="word-block-dictionary-phonetic"
      @click="cycleCandidate"
      :data-level="token.candidates[0].level"
      v-if="token.candidates[candidateIndex].phonetic"
    >
      /{{ token.candidates[candidateIndex].phonetic }}/
    </span>
    <span class="word-block-dictionary-definition"
      > {{
        token.candidates[candidateIndex].definitions.filter(definition => !definition.startsWith('CL'))
          .join(this.$l1.code === 'zh'? '；' : '; ')
          .replace(/\[(.*?)\]/g, ' ($1)')
          .replace(/[一-龥]+\|([一-龥]+)/g, '$1')
      }}{{ this.$l1.code === 'zh'? '。' : '. '}}
    </span>
  </span>
</template>

<script>
import { uniqueId } from '@/lib/utils'

export default {
  props: {
    token: {
      type: Object
    },
    seen: {
      default: false // whether this word has already been annotated ('seen') before
    }
  },
  data() {
    return {
      transliteration: undefined,
      id: `wordblock-dictionary-${uniqueId()}`,
      candidateIndex: 0
    }
  },
  methods: {
    cycleCandidate() {
      if (
        this.token &&
        this.token.candidates &&
        this.token.candidates.length > 0
      ) {
        let newCandidateIndex = this.candidateIndex + 1
        if (newCandidateIndex > this.token.candidates.length - 1)
          newCandidateIndex = 0
        this.candidateIndex = newCandidateIndex
      }
    }
  }
}
</script>

<style lang="scss">
.word-block-dictionary-simplified {
  font-weight: bold;
}
</style>
