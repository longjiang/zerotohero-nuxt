<template>
  <div
    :class="{
      review: true,
      'show-answer': showAnswer,
      'review-light': skin === 'light',
      'review-dark': skin === 'dark',
    }"
  >
    <div
      class="review-item"
      :dir="$l2.direction"
      :class="{
        'text-right':
          $l2.scripts &&
          $l2.scripts.length > 0 &&
          $l2.scripts[0].direction === 'rtl',
      }"
    >
      <Annotate tag="span" :buttons="true" class="transcript-line-l2">
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
          :class="{
            'review-speak-button': true,
            'btn-ghost-dark': skin === 'dark',
          }"
          @click="speak"
        >
          <i class="fas fa-volume-up"></i>
        </button>
      </span>
      <span>
        <button
          :class="{
            'review-seek-button': true,
            'btn-ghost-dark': skin === 'dark',
          }"
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
      <div class="mt-2" v-if="answers">
        <ReviewAnswerButton
          v-for="(answer, index) in answers"
          :key="`quiz-button-${index}`"
          :answer="answer"
          :skin="skin"
          @answered="answered(answer)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Helper from "@/lib/helper";
import FastestLevenshtein from "fastest-levenshtein";
import { mapState } from "vuex";
export default {
  data() {
    return {
      answers: undefined,
      showAnswer: false,
      s: [],
    };
  },
  computed: {
    ...mapState("savedWords", ["savedWords"]),
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
    skin: {
      default: "light",
    },
  },
  async mounted() {
    this.answers = await this.generateAnswers(
      this.reviewItem.text,
      this.reviewItem.word
    );
  },
  methods: {
    async findSimilarWords(text) {
      let words = [];
      let savedWords = this.savedWords[this.$l2.code] || [];
      if (savedWords.length > 1) {
        savedWords = savedWords.map((s) =>
          Object.assign(
            { distance: FastestLevenshtein.distance(s.forms[0], text) },
            s
          )
        );
        savedWords = savedWords
          .filter((w) => w.forms && w.forms[0])
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 2);
        for (let w of savedWords) {
          let word = await (await this.$getDictionary()).get(w.id);
          words.push(word);
        }
      } else {
        words = await (await this.$getDictionary()).lookupFuzzy(text);
        words = words.sort(
          (a, b) =>
            Math.abs(a.head.length - text.length) -
            Math.abs(b.head.length - text.length)
        );
      }
      words = words.filter((word) => word.head !== text);
      words = Helper.uniqueByValue(words, "head");
      return words;
    },
    async generateAnswers(form, word) {
      let similarWords = await this.findSimilarWords(form);
      if (similarWords.length < 2) {
        for (let i of [1, 2]) {
          let randomWord = await (await this.$getDictionary()).random();
          similarWords.push(randomWord);
        }
      }
      let answers = similarWords
        .map((similarWord) => {
          return {
            text: similarWord.head,
            simplified: similarWord.simplified,
            traditional: similarWord.traditional,
            correct: false,
          };
        })
        .slice(0, 2);
      answers.push({
        text: form,
        simplified: word.simplified,
        traditional: word.traditional,
        correct: true,
      });
      return Helper.shuffle(answers);
    },
    async speak() {
      if (this.reviewItem.parallelLines) {
        await Helper.speak(this.reviewItem.parallelLines, this.$l1, 1.1);
      }
      await Helper.speak(this.reviewItem.line.line, this.$l2, 1);
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

<style lang="scss" scoped>
.review {
  margin: 0.5rem 0;
  padding: 1rem;
  border-radius: 0.5rem;
  .review-speak-button,
  .review-seek-button {
    border-radius: 100%;
    width: 1.7rem;
    height: 1.7rem;
    display: inline-block;
    overflow: hidden;
    padding: 0;
    font-size: 0.8em;
  }
  ::v-deep .transcript-line-l2 {
    .highlight {
      display: inline-block;
      min-width: 5rem;
      text-align: center;
    }
  }
  .transcript-line-l1 {
    font-size: 13.44px;
    padding-left: 0.5rem;
  }
  &.review-light {
    background-color: #f3f3f3;
    .review-speak-button,
    .review-seek-button {
      background: white;
      border: 1px solid #999;
      color: #999;
    }
    .transcript-line-l1 {
      color: #999;
    }
    &:not(.show-answer) {
      ::v-deep .transcript-line-l2 {
        .highlight {
          background-color: #ccc;
        }
      }
    }
    &.show-answer {
      background-color: #e4f8e5;
    }
  }
  &.review-dark {
    background: #00000055;
    &:not(.show-answer) {
      ::v-deep .transcript-line-l2 {
        .highlight {
          background: #444;
        }
      }
    }
    &.show-answer {
      background-color: #4070433f;
    }
  }
  &:not(.show-answer) {
    ::v-deep .transcript-line-l2 {
      .highlight {
        border-radius: 0.2rem;
        * {
          opacity: 0;
          pointer-events: none;
        }
      }
    }
  }
}
</style>