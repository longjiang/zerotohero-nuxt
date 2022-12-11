<template>
  <div
    v-observe-visibility="{
      callback: visibilityChanged,
    }"
  >
    <div class="text-center mt-2 mb-2" v-if="reviewItems.length > 0 && !showQuiz"><b-button @click="showQuiz = true" variant="success"><i class="fa-solid fa-ballot-check mr-2"></i> Do Pop Quiz ({{ reviewItems.length }}) <i class="ml-2 fa-solid fa-chevron-down"></i></b-button></div>
    <div v-if="reviewItems.length > 0 && showQuiz">
      <Review
        :key="`review-${currentIndex}`"
        v-bind="reviewItems[currentIndex]"
        skin="dark"
      />
    </div>
    <div
      class="pl-2 pr-2 pt-1 pb-3"
      style="display: flex; justify-content: space-between"
      v-if="showQuiz"
    >
      <button class="btn btn-small btn-dark bg-dark text-gray" @click="prevQuestion" v-if="currentIndex > 0"><i class="fa fa-chevron-left mr-1" />Prev Question</button>
      <span v-else style="min-width: 7rem"></span>
      <span class="text-secondary">{{ currentIndex + 1 }} / {{ reviewItems.length }}</span>
      <button
        class="btn btn-small btn-dark bg-dark text-gray"
        @click="nextQuestion"
        v-if="currentIndex < reviewItems.length - 1"
      >
        Next Question <i class="fa fa-chevron-right ml-1" />
      </button>
      <span v-else style="min-width: 7rem"></span>
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
      showQuiz: true,
      currentIndex: 0,
    }
  },
  computed: {
    lines() {
      return this.quizContent.map(c => c.line.line)
    }
  },
  methods: {
    prevQuestion() {
      this.currentIndex--;
    },
    nextQuestion() {
      this.currentIndex++;
    },
    visibilityChanged(visible) {
      if(visible && this.reviewItems.length === 0) {
        this.generateReviewItems()
      }
    },
    async generateReviewItems() {
      let reviewItems = []
      let maxInstances = 1 // Limit to two questions about the same word
      let seen = {}
      for (let transcriptLineComp of this.quizContent ) {
        let savedWords = transcriptLineComp?.getSavedWords()
        if (savedWords?.length > 0) {
          for (let saved of savedWords) {
            seen[saved.id] = seen[saved.id] || 0
            let savedForm
            for (let form of saved.forms) {
              if (transcriptLineComp.line.line.toLowerCase().includes(form.toLowerCase())) savedForm = form
            }
            let dictionary = await this.$getDictionary()
            let savedWord = await dictionary.get(saved.id)
            if (seen[saved.id] < maxInstances && savedForm && savedWord) {
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
              seen[saved.id] = seen[saved.id] + 1
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