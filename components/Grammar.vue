<template>
  <div :key="'grammar-' + grammarKey">
    <div class="text-center" v-if="grammarPoints && grammarPoints.length > 0">
      <div class="widget-title mb-2">Grammar notes</div>
      <div class="grammar-notes" id="grammar">
        <GrammarPoint v-for="grammar in grammarPoints" :grammar="grammar" />
      </div>
    </div>
  </div>
</template>
<script>
import Helper from '@/lib/helper'
import Grammar from '@/lib/grammar'
import GrammarPoint from '@/components/GrammarPoint'

export default {
  props: {
    text: {
      type: String
    }
  },
  components: {
    GrammarPoint
  },
  data() {
    return {
      Helper,
      grammarKey: 0,
      grammarPoints: undefined
    }
  },
  mounted() {
    this.grammarPoints = Grammar.lookupFuzzy(this.text)
    this.grammarKey += 1
  }
}
</script>
