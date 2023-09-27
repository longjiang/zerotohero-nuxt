<template>
  <div>
    <div class="text-center mt-2 mb-2" v-if="reviewItems.length > 0 && !showQuiz"><b-button @click="showQuiz = true" variant="success"><i class="fa-solid fa-ballot-check mr-2"></i> {{ $t('Do Pop Quiz ({n})', {n: reviewItems.length}) }} <i class="ml-2 fa-solid fa-chevron-down"></i></b-button></div>
    <div v-if="reviewItems.length > 0 && showQuiz">
      <Review
        :key="`review-${currentIndex}`"
        :reviewItem="reviewItems[currentIndex]"
        :skin="skin"
        @reviewItemAnswered="onReviewItemAnswered(reviewItems[currentIndex])"
      />
      <div
        class="pl-2 pr-2 pt-1 pb-3"
        style="display: flex; justify-content: space-between; align-items: center"
      >
        <button :class="`btn btn-sm btn-${$skin} text-gray`" @click="prevQuestion" v-if="currentIndex > 0"><i class="fa fa-chevron-left mr-1" />{{ $t('Prev Question') }}</button>
        <span v-else style="min-width: 7rem"></span>
        <span class="text-secondary">{{ currentIndex + 1 }} / {{ reviewItems.length }}</span>
        <button
          :class="`btn btn-sm btn-${$skin} text-gray`"
          @click="nextQuestion"
          v-if="currentIndex < reviewItems.length - 1"
        >
          {{ $t('Next Question') }} <i class="fa fa-chevron-right ml-1" />
        </button>
        <span v-else style="min-width: 7rem"></span>
      </div>
    </div>
  </div>
</template>

<script>
import { shuffle } from '@/lib/utils'

export default {
  props: {
    reviewItems: {
      type: Array,
      default: () => [],
    },
    skin: {
      type: String,
      default: 'light',
    },
  },
  data() {
    return {
      showQuiz: true,
      currentIndex: 0,
    }
  },
  methods: {
    onReviewItemAnswered() {
      this.$emit('reviewItemAnswered', this.reviewItems[this.currentIndex])
    },
    prevQuestion() {
      this.currentIndex--;
    },
    nextQuestion() {
      this.currentIndex++;
    },
  }
};
</script>

<style>
</style>