<template>
  <div
    :class="{
      review: true,
      'show-answer': showAnswer,
      'review-light': skin === 'light',
      'review-dark': skin === 'dark',
    }"
    style="position: relative"
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
      <div style="float: left; margin-right: 0.5rem; height: 2rem; width: 2.5rem;">
        <img
          src="/img/face-happy.gif"
          alt=""
          style="width: 100%"
          v-if="showAnswer"
        />
        <img
          src="/img/face-surprise.gif"
          alt=""
          style="width: 100%"
          v-else-if="wrong"
        />
        <img
          src="/img/face-straight.gif"
          alt=""
          style="width: 100%"
          v-else
        />
      </div>
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
      <small style="opacity: 0.5; cursor: pointer" @click="scrollToLine">
        <i class="fa fa-arrow-up"></i>
      </small>
      <div
        v-if="$l2.code !== $l1.code && reviewItem.parallelLines"
        :dir="$l1.direction === 'rtl' ? 'rtl' : 'ltr'"
        :class="{
          'transcript-line-l1 text-left mt-2': true,
          'text-right':
            $l1.scripts &&
            $l1.scripts.length > 0 &&
            $l1.scripts[0].direction === 'rtl',
        }"
        style="opacity: 0.7"
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
      wrong: false,
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
    scrollToLine() {
      this.$parent.seekVideoTo(this.reviewItem.line.starttime);
      this.$parent.play();
    },
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
            FastestLevenshtein.distance(a.head, text) -
            FastestLevenshtein.distance(b.head, text)
        );
      }
      words = words.filter(
        (word) => word.head.toLowerCase() !== text.toLowerCase()
      );
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
        this.wrong = false;
        var audio = new Audio("/audio/correct-ding.mp3");
        audio.volume = 0.2;
        audio.play();
      } else {
        this.wrong = true;
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
  border: 1px solid #ffb7002b;
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
      border-bottom: 1px solid white;
    }
  }
  .transcript-line-l1 {
    font-size: 13.44px;
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
    border-radius: 0.5rem;
    background: #dea4171f;
    &:not(.show-answer) {
      ::v-deep .transcript-line-l2 {
        .highlight {
          background: rgba(0, 0, 0, 0);
          margin: 0 0.2rem;
          position: relative;
          bottom: 0.2rem;
        }
      }
    }
    &.show-answer {
      background-color: #4070433f;
      border: 1px solid #093909;
    }
  }
  &:not(.show-answer) {
    ::v-deep .transcript-line-l2 {
      .highlight {
        color: rgba(0, 0, 0, 0);
        * {
          opacity: 0;
          pointer-events: none;
        }
      }
    }
  }
}
</style>