<template>
  <div
    :class="{
      review: true,
      'show-answer': showAnswer,
      wrong,
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
      <div class="smiley-line-wrapper">
        <div class="smiley">
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
          <img src="/img/face-straight.gif" alt="" style="width: 100%" v-else />
        </div>
        <div class="line-wrapper">
          <Annotate tag="span" :buttons="true" class="transcript-line-l2">
            <span
              v-if="$l2.han && $l2.code !== 'ja'"
              v-html="
                highlightMultiple(
                  line.line,
                  unique([simplified, traditional]),
                  hsk
                )
              "
            />
            <span v-else v-html="highlight(line.line, text, hsk)" />
          </Annotate>
          <div
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
            <span
              v-if="$l2.code !== $l1.code && parallelLines"
              v-html="parallelLines"
            />
            <small class="ml-1" style="cursor: pointer" @click="scrollToLine">
              <i class="fa fa-arrow-up"></i>
            </small>
          </div>
        </div>
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
import {distance, closest} from "fastest-levenshtein";
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
    line: {
      type: Object, // {"starttime":89.14,"duration":3.5,"line":". . . ","count":1},
    },
    lineIndex: {
      type: [Number, String],
    },
    parallelLines: {
      type: String, // "Shouldn&#39;t respect for the living world, for nature, be enough?"
    },
    text: {
      type: String, // "suffire"
    },
    word: {
      type: Object, // Word object from the dictionary
    },
    simplified: {
      type: String, // simplified form of the saved word (Han script only)
    },
    traditional: {
      type: String, // traditional form of the saved word (Han script only)
    },
    hsk: {
      default: "outside",
    },
    skin: {
      default: "light",
    },
  },
  async mounted() {
    this.answers = await this.generateAnswers(this.text, this.word);
  },
  methods: {
    scrollToLine() {
      this.$parent.$parent.seekVideoTo(this.line.starttime);
      this.$parent.$parent.play();
    },
    async findSimilarWords(text) {
      let words = [];
      let savedWords = this.savedWords[this.$l2.code] || [];
      if (savedWords.length > 1) {
        savedWords = savedWords.map((s) =>
          Object.assign(
            {
              distance: distance(
                s.forms[0] || s.simplified,
                text
              ),
            },
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
            distance(a.head, text) -
            distance(b.head, text)
        );
      }
      words = words.filter(
        (word) =>
          word && word.head && word.head.toLowerCase() !== text.toLowerCase()
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
      if (this.parallelLines) {
        await Helper.speak(this.parallelLines, this.$l1, 1.1);
      }
      await Helper.speak(this.line.line, this.$l2, 1);
    },
    async answered(answer) {
      if (answer.correct) {
        this.showAnswer = true;
        this.wrong = false;
        var audio = new Audio("/audio/correct-ding.mp3");
        audio.volume = 0.2;
        audio.play();
      } else {
        this.wrong = false;
        await Helper.timeout(100);
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
  :deep(.highlight) {
    display: inline-block;
    min-width: 5rem;
    text-align: center;
    border-bottom: 1px solid white;
    color: #00000000 !important;
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
      :deep(.transcript-line-l2) {
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
      :deep(.highlight) {
        background: rgba(0, 0, 0, 0);
        margin: 0 0.2rem;
        position: relative;
        bottom: 0.2rem;
      }
    }
    &.show-answer {
      background-color: #4070433f;
      border: 1px solid #093909;
    }
  }
  &:not(.show-answer) {
    :deep(.transcript-line-l2) {
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

/* https://css-tricks.com/snippets/css/shake-css-keyframe-animation/ */
.wrong {
  animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  perspective: 1000px;
}

@keyframes shake {
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }

  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }

  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }

  40%,
  60% {
    transform: translate3d(4px, 0, 0);
  }
}
.smiley-line-wrapper {
  display: flex;
  .smiley {
    margin-right: 0.5rem;
    margin-bottom: 0.5rem;
    height: 2rem;
    width: 2.5rem;
  }
  .line-wrapper {
    padding-left: 0.5rem;
    flex: 1;
  }
}
</style>