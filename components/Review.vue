<template>
  <div :class="{ review: true, 'show-answer': showAnswer }">
    <div class="review-item mt-2">
      <div
        v-if="$l2.code !== $l1.code && parallellines"
        :class="{
          'transcript-line-l1': true,
          'text-right':
            $l2.scripts &&
            $l2.scripts.length > 0 &&
            $l2.scripts[0].direction === 'rtl',
        }"
      >
        <template
          v-for="(parallelLine, parallelLineIndex) in parallellines.filter(
            (l) => l.starttime === reviewItem.line.starttime
          )"
        >
          <span
            v-html="parallelLine.line"
            :key="`review-parallel-line-${parallelLineIndex}`"
          />
        </template>
      </div>
      <Annotate tag="span" :buttons="true" class="transcript-line-chinese">
        <span
          v-if="$l2.han && $l2.code !== 'ja'"
          v-html="
            highlightMultiple(
              reviewItem.line.line,
              unique([reviewItem.simplified, reviewItem.traditional]),
              hsk
            )
          "
        />
        <span
          v-else
          v-html="highlight(reviewItem.line.line, reviewItem.text, hsk)"
        />
      </Annotate>
      <Speak :text="reviewItem.line.line" />
      <button
        class="btn p-0"
        style="color: #999"
        @click="$parent.seekVideoTo(reviewItem.line.starttime)"
      >
        <i class="fas fa-arrow-up"></i>
      </button>
      <div class="mt-2">
        <ReviewAnswerButton
          v-for="(answer, index) in reviewItem.answers"
          :key="`quiz-button-${index}`"
          :answer="answer"
          @answered="answered(answer)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Helper from "@/lib/helper";
export default {
  data() {
    return {
      showAnswer: false
    };
  },
  computed: {
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
  },
  props: {
    parallellines: {
      type: Array,
    },
    reviewItem: {
      type: Object,
    },
    hsk: {
      default: "outside",
    },
  },
  methods: {
    answered(answer) {
      console.log(answer)
      if (answer.correct) {
        this.showAnswer = true
      }
    },
    highlightMultiple() {
      return Helper.highlightMultiple(...arguments);
    },
    highlight() {
      return Helper.highlight(...arguments);
    },
    unique() {
      return Helper.unique(...arguments);
    },
    updated() {
      this.showAnswer = false
    }
  },
};
</script>

<style lang="scss">
.review {
  margin: 0.5rem 0;
  padding: 1rem;
  background-color: #f3f3f3;
  border-radius: 0.5rem;
  &.show-answer {
    background-color: #d6f5d8;
  }
}

.review:not(.show-answer) {
  .highlight {
    background-color: #ccc;
    border-radius: 0.2rem;
  }
  .highlight * {
    opacity: 0;
    pointer-events: none;
  }
}
</style>