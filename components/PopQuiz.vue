<template>
  <div
    v-observe-visibility="{
      callback: visibilityChanged,
    }"
  >
    <div class="text-center mt-2 mb-2" v-if="reviewItems.length > 0 && !showQuiz"><b-button @click="showQuiz = true" variant="success"><i class="fa-solid fa-ballot-check mr-2"></i> Do Pop Quiz ({{ reviewItems.length }}) <i class="ml-2 fa-solid fa-chevron-down"></i></b-button></div>
    <div v-if="reviewItems.length > 0 && showQuiz">
      <Review
        v-for="(reviewItem, reviewItemIndex) in reviewItems"
        :key="`review-${reviewItemIndex}`"
        v-bind="reviewItem"
        skin="dark"
      />
    </div>
  </div>
</template>

<script>
import { shuffle } from '@/lib/utils'

export default {
  props: {
    quizContent: {
      type: Array, // Array of references to TranscriptLine components
    },
  },
  data() {
    return {
      reviewItems: [],
      showQuiz: false,
    }
  },
  computed: {
    lines() {
      return this.quizContent.map(c => c.line.line)
    }
  },
  methods: {
    visibilityChanged(visible) {
      if(visible && this.reviewItems.length === 0) {
        this.generateReviewItems()
      }
    },
    async generateReviewItems() {
      let reviewItems = []
      for (let transcriptLineComp of this.quizContent ) {
        let savedWords = transcriptLineComp?.getSavedWords()
        if (savedWords?.length > 0) {
          for (let saved of savedWords) {
            let savedForm
            for (let form of saved.forms) {
              if (transcriptLineComp.line.line.toLowerCase().includes(form.toLowerCase())) savedForm = form
            }
            let dictionary = await this.$getDictionary()
            let savedWord = await dictionary.get(saved.id)
            if (savedForm && savedWord) {
              let reviewItem = {
                line: transcriptLineComp.line,
                lineIndex: transcriptLineComp.lineIndex,
                parallelLines: transcriptLineComp.parallelLine,
                text: savedForm,
                word: savedWord,
                simplified: savedWord.simplified,
                traditional: savedWord.traditional,
              };
              reviewItems.push(reviewItem)
            }
          }
        }
      }
      this.reviewItems = shuffle(reviewItems)
    }
  }
};
</script>

<style>
</style>