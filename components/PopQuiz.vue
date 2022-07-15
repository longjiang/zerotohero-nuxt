<template>
  <div
    v-observe-visibility="{
      callback: visibilityChanged,
      once: true,
    }"
  >
    <h6>POP QUIZ</h6>
    <div v-if="reviewItems"></div>
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
      reviewItems: undefined
    }
  },
  methods: {
    visibilityChanged(visible) {
      if(visible) {
        this.generateReviewItems()
      }
    },
    generateReviewItems() {
      console.log({ quizContent: this.quizContent})
    }
  }
};
</script>

<style>
</style>