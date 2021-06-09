<template>
  <div :class="{ review: true, 'show-answer': showAnswer }">
    <div class="review-item">
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
      <span class="ml-1">
        <button
          style="
            background: white;
            border-radius: 100%;
            border: 1px solid #999;
            color: #999;
            width: 1.7rem;
            height: 1.7rem;
            display: inline-block;
            overflow: hidden;
            padding: 0;
            font-size: 0.8em;
          "
          @click="speak"
        >
          <i class="fas fa-volume-up"></i>
        </button>
      </span>
        <button
          style="
            background: white;
            border-radius: 100%;
            border: 1px solid #999;
            color: #999;
            width: 1.7rem;
            height: 1.7rem;
            display: inline-block;
            overflow: hidden;
            padding: 0;
            font-size: 0.8em;
          "
          @click="$parent.seekVideoTo(reviewItem.line.starttime)"
        >
          <i class="fas fa-arrow-up"></i>
        </button>
      </span>
      <div
        v-if="$l2.code !== $l1.code && reviewItem.parallelLines"
        :class="{
          'transcript-line-l1': true,
          'text-right':
            $l2.scripts &&
            $l2.scripts.length > 0 &&
            $l2.scripts[0].direction === 'rtl',
        }"
      >
        <span v-html="reviewItem.parallelLines" />
      </div>
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
      showAnswer: false,
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
    reviewItem: {
      type: Object,
    },
    hsk: {
      default: "outside",
    },
  },
  methods: {
    async speak() {
      if (this.reviewItem.parallelLines) {
        await Helper.speak(this.reviewItem.parallelLines.replace(/&#39;/g, "’"), this.$l1, 1.1)
      }
      await Helper.speak(this.reviewItem.line.line, this.$l2, 1)
    },
    answered(answer) {
      if (answer.correct) {
        this.showAnswer = true;
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
      this.showAnswer = false;
    },
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
    background-color: #e4f8e5;
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


.review .transcript-line-l1 {
  color: #999;
  font-size: 13.44px;
  padding-left: 0.5rem;
}
</style>