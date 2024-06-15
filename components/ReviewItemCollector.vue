<template>
  <div>
    <!-- show the quiz in a modal-->
    <!-- no-fade is turned on to prevent a "ghosted" modal on iOS that blocks and disables the entire UI -->
    <b-modal
      id="quiz-modal"
      size="lg"
      centered
      hide-footer
      no-fade
      :title="$t('Pop Quiz')"
      body-class="playlist-modal-wrapper p-4"
      modal-class="safe-padding-top mt-4"
      @show="onPopQuizModalShown"
      @hide="onPopQuizModalHidden"
    >
      <PopQuiz
        skin="light"
        v-bind="{ reviewItems }"
        @goToLine="$emit('goToLine', $event); $bvModal.hide('quiz-modal');"
      />
    </b-modal>
    <!-- The following div is for testing purposes -->
    <div class="test-container">
      <div class="review-items-count">{{ reviewItems.length }} review items</div>
      <ul class="review-items-list">
        <li v-for="reviewItem in reviewItems" :key="reviewItem.word.id">
          {{ reviewItem.text }}
        </li>
      </ul>
      <b-button class="show-quiz-button" @click="showQuizIfThereAreReviewItems">Show Quiz</b-button>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    // If false, do not periodically show the quiz (as in the case when the video is paused and the user may be reading the transcript)
    active: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      reviewItems: [],
      reviewIntervalMinutes: 2, // Interval in minutes to show the quiz
    };
  },
  mounted() {
    this.interval = setInterval(() => {
      this.showQuizIfThereAreReviewItems();
    }, 1000 * 60 * this.reviewIntervalMinutes);
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type === "savedWords/REMOVE_SAVED_WORD") {
        this.reviewItems = this.reviewItems.filter(
          (reviewItem) => reviewItem.word.id !== mutation.payload.word.id
        );
      }
    });
  },
  beforeDestroy() {
    this.unsubscribe();
    // remove the interval
    clearInterval(this.interval);
  },
  methods: {
    onPopQuizModalShown() {
      this.$emit("showQuiz");
    },
    onPopQuizModalHidden() {
      // Clear the answered review items
      this.reviewItems = this.reviewItems.filter((reviewItem) => !reviewItem.answered);
      this.$emit("hideQuiz");
    },
    async showQuizIfThereAreReviewItems() {
      await this.$nextTick();
      if (this.reviewItems?.length > 0) {
        this.$bvModal.show("quiz-modal");
      }
    },
    async addLineToReview({
      savedWords,
      line,
      lineIndex,
      parallelLine,
      video,
    }) {
      let maxInstances = 1; // Limit to one questions about the same word
      let seen = {};
      for (let savedWord of savedWords) {
        let saved = savedWord.saved; // The `saved` property is a object saved to the vuex store, with the properties { id, form, date, context }
        if (!saved) {
          // use vuex savedWords/has getter to retrieve it
          saved = this.$store.getters["savedWords/has"](
            { l2: this.$l2.code, id: savedWord.id }
          );
          if (!saved) {
            console.error(
              "Saved word does not have the `saved` property, and is not found in vuex store",
              { savedWord },
            );
            continue;
          }
        }
        seen[saved.id] = seen[saved.id] || 0; // e.g. { 36178: 0 } means we've seen saved word 36178 zero times
        let savedForm;
        let forms = saved.forms || [saved.head];
        for (let form of forms) {
          if (line.line.toLowerCase().includes(form.toLowerCase()))
            savedForm = form;
        }
        if (seen[saved.id] < maxInstances && savedForm && savedWord) {
          let reviewItem = {
            video,
            line,
            lineIndex,
            parallelLines: parallelLine,
            text: savedForm,
            word: savedWord, // A full word object
            hsk: savedWord.hsk,
            simplified: savedWord.simplified,
            traditional: savedWord.traditional,
          };
          // Make sure we don't have two review items with exactly the same words and line
          let existingReviewItem = this.reviewItems.find(
            (r) =>
              r.text === reviewItem.text &&
              r.word.id === reviewItem.word.id &&
              r.line.line === reviewItem.line.line
          );
          if (!existingReviewItem) {
            this.reviewItems.push(reviewItem);
          }          
          seen[saved.id] = seen[saved.id] + 1;
        }
      }
    },
  },
};
</script>
