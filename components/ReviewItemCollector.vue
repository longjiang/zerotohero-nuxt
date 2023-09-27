<template>
  <div>
    <!-- show the quiz in a modal-->
    <PopQuiz
      class="pl-4"
      v-bind="{
        reviewItems
      }"
    />
    <!-- <b-modal
      id="quiz-modal"
      size="lg"
      centered
      hide-footer
      :title="$t('Pop Quiz')"
      body-class="playlist-modal-wrapper"
      modal-class="safe-padding-top mt-4"
      @show="onPopQuizModalShown"
    >
      <PopQuiz
        class="pl-4"
        skin="light"
        v-bind="{
          reviewItems: reviewItems.filter(reviewItem => !reviewItem.answered),
        }"
      />
    </b-modal> -->
  </div>
</template>
<script>
export default {
  data() {
    return {
      reviewItems: [],
    };
  },
  mounted() {
    // If there are review items, show them every two minutes
    // setInterval(() => {
    //   this.showQuizIfThereAreUnansweredItems();
    // }, 1000 * 60 * 2);
    // listen to vuex savedWords removed mutation
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type === "savedWords/REMOVE_SAVED_WORD") {
        this.reviewItems = this.reviewItems.filter(
          (reviewItem) => reviewItem.word.id !== mutation.payload.word.id
        );
      }
    });
  },
  beforeDestroy() {
    // you may call unsubscribe to stop the subscription
    this.unsubscribe();
  },
  methods: {
    onPopQuizModalShown() {
    },
    showQuizIfThereAreUnansweredItems() {
      if (this.reviewItems?.filter(reviewItem => !reviewItem.answered).length > 0) {
        this.$bvModal.show("quiz-modal");
        this.$emit("showQuiz");
      }
    },
    async addLineToReview({
      savedWords,
      line,
      lineIndex,
      parallelLine,
      video,
    }) {
      let maxInstances = 1; // Limit to two questions about the same word
      let seen = {};
      for (let saved of savedWords) {
        seen[saved.id] = seen[saved.id] || 0;
        let savedForm;
        let forms = saved.forms || [saved.head];
        for (let form of forms) {
          if (line.line.toLowerCase().includes(form.toLowerCase()))
            savedForm = form;
        }
        let dictionary = await this.$getDictionary();
        let savedWord = await dictionary.get(saved.id);
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
          this.reviewItems.push(reviewItem);
          seen[saved.id] = seen[saved.id] + 1;
        }
      }
    },
  },
};
</script>
