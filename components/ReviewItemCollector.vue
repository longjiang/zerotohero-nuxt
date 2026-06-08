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
  computed: {
    showQuiz() {
      return this.$l2Settings?.showQuiz;
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
      this.showQuizPopupIfThereAreReviewItems();
    }, 1000 * 60 * this.reviewIntervalMinutes);
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type === "savedWords/REMOVE_SAVED_WORD") {
        this.reviewItems = this.reviewItems.filter(
          (reviewItem) => reviewItem.word.id !== mutation.payload.word.id
        );
      }
    });
    this.$nuxt.$on('showQuizPopup', this.showQuizPopup);
  },
  beforeDestroy() {
    this.unsubscribe();
    // remove the interval
    clearInterval(this.interval);
    this.$nuxt.$off('showQuizPopup', this.showQuizPopup);
  },
  methods: {
    onPopQuizModalShown() {
      this.$emit("onQuizShown");
    },
    onPopQuizModalHidden() {
      // Clear the answered review items
      this.reviewItems = this.reviewItems.filter((reviewItem) => !reviewItem.answered);
      this.$emit("onQuizHidden");
    },
    showQuizPopup() {
      this.$bvModal.show("quiz-modal");
    },
    async showQuizPopupIfThereAreReviewItems() {
      await this.$nextTick();
      if (this.reviewItems?.length > 0 && this.showQuiz) {
        this.showQuizPopup();
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
