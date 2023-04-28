<template>
  <div class="review-wrapper" v-observe-visibility="visibilityChanged">
    <div>
      <Review
        v-bind="reviewFiltered[currentIndex]"
        :key="`review-question-${currentIndex}`"
        :hsk="hsk"
        :skin="skin"
      />
    </div>
    <div
      class="pl-2 pr-2 pt-1 pb-3"
      style="display: flex; justify-content: space-between"
    >
      <button class="btn btn-small btn-dark bg-dark text-gray" @click="prevQuestion" v-if="currentIndex > 0"><i class="fa fa-chevron-left mr-1" />Prev Question</button>
      <span v-else></span>
      <button
        class="btn btn-small btn-dark bg-dark text-gray"
        @click="nextQuestion"
        v-if="currentIndex < reviewFiltered.length - 1"
      >
        Next Question <i class="fa fa-chevron-right ml-1" />
      </button>
      <span v-else></span>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Helper from "@/lib/helper";

export default {
  props: {
    lines: {
      type: Array,
    },
    matchedParallelLines: {
      type: Array,
    },
    hsk: {
      type: [Number, String],
    },
    skin: {
      default: "light",
    },
  },
  data() {
    return {
      active: false, // activate only when visible the first time
      review: [],
      reviewOpen: true,
      currentIndex: 0,
    };
  },
  computed: {
    ...mapState("savedWords", ["savedWords"]),
    ...mapState("settings", ["l2Settings"]),
    $l2Settings() {
      let $l2Settings = {};
      if (this.l2Settings && this.l2Settings[this.$l2.code])
        $l2Settings = this.l2Settings[this.$l2.code];
      return $l2Settings;
    },
    quiz() {
      if (typeof this.$l2Settings !== "undefined")
        return this.$l2Settings.showQuiz;
      else return false;
    },
    reviewFiltered() {
      let reviewFiltered = this.review.slice(
        0,
        this.reviewOpen ? this.review.length : 1
      );
      return reviewFiltered;
    },
  },
  beforeDestroy() {
    if (this.unsubscribe) this.unsubscribe();
  },
  created() {
    this.unsubscribe = this.$store.subscribe((mutation) => {
      this.updateReview(mutation);
    });
  },
  methods: {
    prevQuestion() {
      this.currentIndex--;
    },
    nextQuestion() {
      this.currentIndex++;
    },
    /**
     * Generate review items during initial load.
     */
    async visibilityChanged(visible) {
      if (visible) {
        if (
          !this.active &&
          this.savedWords &&
          this.savedWords[this.$l2.code] &&
          this.review.length === 0
        ) {
          this.review = await this.generateReview();
        }
        this.active = true;
      }
    },
    async generateReview() {
      let reviewItems = [];
      const dictionary = await this.$getDictionary();
      for (let savedWord of this.savedWords[this.$l2.code]) {
        let word = await dictionary.get(savedWord.id);
        if (word) {
          reviewItems = reviewItems.concat(
            await this.reviewItemsForWord(word, savedWord.forms)
          );
        }
      }
      return reviewItems;
    },
    reviewConditions(lineIndex, form, word) {
      let line = this.lines[lineIndex];
      if (["en", "ru"].includes(this.$l2.code)) {
        return line.line.includes(form);
      }
      if (
        (this.$l2.continua || this.$l2.agglutinative) &&
        line.line.includes(form)
      )
        return true;
      if (
        this.$l2.han &&
        (line.line.includes(word.simplified) ||
          line.line.includes(word.traditional))
      )
        return true;
      if (!this.$l2.continua) {
        form = Helper.escapeRegExp(form);
        let found = false;
        try {
          found =
            new RegExp(`[ .,:!?]${form}[ .,:!?]`, "gi").test(line.line) ||
            new RegExp(`^${form}[ .,:!?]`, "gi").test();
        } catch (err) {}
        return found;
      }
    },
    async reviewItemsForWord(word, wordForms) {
      let reviewItems = [];
      let forms = wordForms.filter((form) => form && form !== "-");
      forms = Helper.uniqueIgnoreCase(forms);
      let maxInstances = 1; // Limit to two questions about the same word
      let seen = 0;
      for (let form of forms.sort((a, b) => b.length - a.length)) {
        for (let lineIndex in this.lines) {
          if (
            seen < maxInstances &&
            this.reviewConditions(lineIndex, form, word)
          ) {
            let reviewItem = await this.generateReviewItem(
              lineIndex,
              form,
              word
            );
            reviewItems.push(reviewItem);
            seen++;
          }
        }
      }
      return reviewItems;
    },
    async generateReviewItem(lineIndex, form, word) {
      let line = this.lines[lineIndex];
      let parallelLines = this.matchedParallelLines
        ? this.matchedParallelLines[lineIndex]
        : undefined;
      return {
        line,
        lineIndex,
        parallelLines,
        text: form,
        word,
        simplified: word.simplified,
        traditional: word.traditional,
      };
    },
    async updateReview(mutation) {
      if (mutation.type === "savedWords/LOAD") {
        if (this.review.length === 0) this.review = await this.generateReview();
      }
      if (mutation.type === "savedWords/ADD_SAVED_WORD") {
        this.review = this.review.concat(
          await this.reviewItemsForWord(
            mutation.payload.word,
            mutation.payload.wordForms
          )
        );
      } else if (mutation.type === "savedWords/REMOVE_SAVED_WORD") {
        this.review = this.review.filter(
          (reviewItem) => mutation.payload.word.id !== reviewItem.word.id
        );
      }
    },
  },
};
</script>

<style>
</style>