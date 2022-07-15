<template>
  <div
    v-observe-visibility="{
      callback: visibilityChanged,
    }"
  >
    <h6>POP QUIZ</h6>
    <div v-if="reviewItems.length > 0">
      <Review
        v-for="(reviewItem, reviewItemIndex) in reviewItems"
        :key="`review-${reviewItemIndex}`"
        :reviewItem="reviewItem"
        skin="dark"
      />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    quizContent: {
      type: Array, // Array of references to TranscriptLine components
    },
  },
  data() {
    return {
      reviewItems: []
    }
  },
  methods: {
    visibilityChanged(visible) {
      if(visible && this.reviewItems.length === 0) {
        for (let transcriptLineComp of this.quizContent ) {
          if (!transcriptLineComp.annotated) return // Proceed only if all transcript lines are annotated already
        }
        this.generateReviewItems()
      }
    },
    async generateReviewItems() {
      let reviewItems = []
      for (let transcriptLineComp of this.quizContent ) {
        if (transcriptLineComp.savedWordblocks.length > 0) {
          let saved = transcriptLineComp.savedWordblocks[0].saved
          let savedForm
          for (let form of saved.forms) {
            if (transcriptLineComp.line.line.includes(form)) savedForm = form
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
      this.reviewItems = reviewItems
    }
  }
};
</script>

<style>
</style>