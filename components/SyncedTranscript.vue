<template>
  <div class="synced-transcript">
    <div
      :class="{
        transcript: true,
        collapsed: collapse,
        'single-line': single,
      }"
      data-collapse-target
      :key="reviewKey"
    >
      <template v-for="(line, lineIndex) in lines">
        <div
          :key="lineIndex"
          :class="{
            'transcript-line': true,
            matched:
              !single &&
              highlight &&
              line &&
              new RegExp(highlight.join('|')).test(line.line),
            'transcript-line-current': currentLine === line,
          }"
          @click="seekVideoTo(line.starttime)"
          :id="`transcript-line-${id}-${lineIndex}`"
          v-if="!single || currentLine === line"
        >
          <b-button
            v-if="$settings.adminMode"
            class="btn btn-small bg-danger text-white"
            @click="removeLine(lineIndex)"
            style="float: right"
          >
            <i class="fa fa-trash"></i>
          </b-button>
          <Annotate
            tag="div"
            :sticky="sticky"
            class="transcript-line-chinese pl-3"
            :buttons="true"
          >
            <span
              v-html="
                highlight
                  ? Helper.highlightMultiple(
                      line.line,
                      highlight,
                      hsk || 'outside'
                    )
                  : line.line
              "
            />
          </Annotate>
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
              v-for="parallelLine in parallellines.filter(
                (l) => l.starttime === line.starttime
              )"
            >
              <span v-html="parallelLine.line" />
            </template>
          </div>
        </div>
        <template v-if="review[lineIndex] && review[lineIndex].length > 0">
          <div class="review" v-for="reviewItem in review[lineIndex]">
            <h6>Pop Quiz</h6>
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
                  v-for="parallelLine in parallellines.filter(
                    (l) => l.starttime === reviewItem.line.starttime
                  )"
                >
                  <span v-html="parallelLine.line" />
                </template>
              </div>
              <Annotate
                tag="span"
                :buttons="true"
                class="transcript-line-chinese"
              >
                <span
                  v-if="$l2.han && $l2.code !== 'ja'"
                  v-html="
                    Helper.highlightMultiple(
                      reviewItem.line.line,
                      Helper.unique([
                        reviewItem.simplified,
                        reviewItem.traditional,
                      ]),
                      hsk
                    )
                  "
                />
                <span
                  v-else
                  v-html="
                    Helper.highlight(reviewItem.line.line, reviewItem.text, hsk)
                  "
                />
              </Annotate>
              <Speak :text="reviewItem.line.line" />
              <button
                class="btn p-0"
                style="color: #999"
                @click="seekVideoTo(reviewItem.line.starttime)"
              >
                <i class="fas fa-arrow-up"></i>
              </button>
              <div class="mt-2">
                <button
                  v-for="(answer, index) in reviewItem.answers"
                  :key="`quiz-button-${index}`"
                  :class="{
                    btn: true,
                    'btn-small': true,
                    'bg-white': true,
                    'mr-2': true,
                    'review-answer': true,
                    checked: false,
                    'review-answer-correct': answer.correct,
                  }"
                  @click="answerClick"
                >
                  <template v-if="$l2.code === 'ja' || !$l2.han">
                    {{ answer.text }}
                  </template>
                  <template v-else-if="$l2.han && $settings.useTraditional">
                    {{ answer.traditional || answer.simplified }}
                  </template>
                  <template v-else-if="$l2.han && !$settings.useTraditional">
                    {{ answer.simplified || answer.traditional }}
                  </template>
                </button>
              </div>
            </div>
          </div>
        </template>
      </template>
    </div>
    <ShowMoreButton v-if="collapse" :data-bg-level="hsk ? hsk : 'outside'">
      Show More
    </ShowMoreButton>
  </div>
</template>

<script>
import Helper from "@/lib/helper";

export default {
  props: {
    quiz: {
      default: false,
    },
    sticky: {
      default: false,
    },
    single: {
      default: false,
    },
    lines: {
      type: Array,
    },
    parallellines: {
      default: false,
    },
    collapse: {
      default: false,
    },
    onSeek: {
      default: false,
    },
    onPause: {
      default: false,
    },
    highlight: {
      type: Array,
    },
    hsk: {
      default: "outside",
    },
    highlightSavedWords: {
      default: true,
    },
    startLineIndex: {
      default: 0,
    },
    stopLineIndex: {
      default: -1,
    },
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
    $dictionary() {
      return this.$getDictionary();
    },
    $dictionaryName() {
      return this.$store.state.settings.dictionaryName;
    },
    $hanzi() {
      return this.$getHanzi();
    },
    currentLineIndex() {
      return this.lines.findIndex((line) => line === this.currentLine);
    },
    previousLine() {
      let previousIndex = Math.max(this.currentLineIndex - 1, 0);
      return this.lines && this.lines[previousIndex]
        ? this.lines[previousIndex]
        : false;
    },
    nextLine() {
      return this.lines && this.lines[this.currentLineIndex + 1]
        ? this.lines[this.currentLineIndex + 1]
        : false;
    },
  },
  data() {
    return {
      sW: [],
      id: Helper.uniqueId(),
      Helper,
      previousTime: 0,
      currentTime: 0,
      currentLine: undefined,
      review: {},
      paused: true,
      repeat: false,
      reviewKey: 0,
      neverPlayed: true,
    };
  },
  mounted() {
    this.lines.map((line) => {
      line.starttime = Number(line.starttime);
    });
    this.currentLine =
      this.lines && this.lines[this.startLineIndex]
        ? this.lines[this.startLineIndex]
        : undefined;
    if (this.highlightSavedWords) this.updateReview();
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("savedWords")) {
        this.updateReview();
      }
    });
  },
  updated() {
    this.scrollTo(this.currentLineIndex);
  },
  beforeDestroy() {
    // you may call unsubscribe to stop the subscription
    this.unsubscribe();
  },
  watch: {
    $settings() {
      if (this.highlightSavedWords) this.updateReview();
    },
    currentTime() {
      let nearestLine = this.nearestLine(this.currentTime);
      let progress = this.currentTime - this.previousTime;
      if (
        this.repeat &&
        this.currentLine !== nearestLine &&
        progress > 0 &&
        progress < 0.15
      )
        this.rewind();
      else this.currentLine = nearestLine;
      this.previousTime = this.currentTime;
    },
    currentLine() {
      this.scrollTo(this.currentLineIndex);
    },
  },
  methods: {
    nearestLine(time) {
      let nearestLine = this.lines[0];
      for (let line of this.lines) {
        if (line.starttime > time) {
          break;
        } else {
          nearestLine = line;
        }
      }
      return nearestLine;
    },
    removeLine(lineIndex) {
      this.lines.splice(lineIndex, 1);
      this.reviewKey++;
    },
    answerClick(e) {
      $(e.target).addClass("checked");
      if ($(e.target).hasClass("review-answer-correct")) {
        $(e.target).parents(".review").addClass("show-answer");
      }
    },
    async findSimilarWords(text) {
      let words = await (await this.$getDictionary()).lookupFuzzy(text);
      words = words.filter((word) => word.head !== text);
      words = Helper.uniqueByValue(words, "head");
      return words.sort(
        (a, b) =>
          Math.abs(a.head.length - text.length) -
          Math.abs(b.head.length - text.length)
      );
    },
    async updateReview() {
      let review = {};
      let lineOffset = 10; // Show review this number of lines after the first appearance of the word
      if (
        this.quiz &&
        this.$settings.showQuiz &&
        this.$store.state.savedWords.savedWords &&
        this.$store.state.savedWords.savedWords[this.$l2.code]
      ) {
        for (let savedWord of this.$store.state.savedWords.savedWords[
          this.$l2.code
        ]) {
          let word = await (await this.$getDictionary()).get(savedWord.id);
          if (word) {
            let seenLines = [];
            for (let form of savedWord.forms
              .filter((form) => form && form !== "-")
              .sort((a, b) => b.length - a.length)) {
              for (let lineIndex in this.lines) {
                if (!seenLines.includes(lineIndex)) {
                  let line = this.lines[lineIndex];
                  if (
                    (this.$l2.continua && line.line.includes(form)) ||
                    (this.$l2.han &&
                      (line.line.includes(word.simplified) ||
                        line.line.includes(word.traditional))) ||
                    (!this.$l2.continua &&
                      (new RegExp(`[ .,:!?]${form}[ .,:!?]`, "gi").test(
                        line.line
                      ) ||
                        new RegExp(`^${form}[ .,:!?]`, "gi").test()))
                  ) {
                    let reviewIndex = Math.min(
                      Math.ceil(
                        (Number(lineIndex) +
                          lineOffset +
                          Math.floor(form.length / 2)) /
                          10
                      ) * 10,
                      this.lines.length - 1
                    );
                    let similarWords = await this.findSimilarWords(form);
                    if (similarWords.length < 2) {
                      for (let i of [1, 2]) {
                        let randomWord = await (
                          await this.$getDictionary()
                        ).random();
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
                    review[reviewIndex] = review[reviewIndex] || [];
                    review[reviewIndex].push({
                      line: line,
                      text: form,
                      word: word,
                      simplified: word.simplified,
                      traditional: word.traditional,
                      answers: Helper.shuffle(answers),
                    });
                    seenLines.push(lineIndex);
                  }
                }
              }
            }
          }
        }
      }
      this.review = review;
      this.reviewKey++;
    },
    seekVideoTo(starttime) {
      if (this.onSeek) {
        this.onSeek(starttime);
      }
    },
    pauseVideo() {
      if (this.onPause) {
        this.onPause();
      }
    },
    scrollTo(lineIndex) {
      let el = document.getElementById(
        `transcript-line-${this.id}-${lineIndex}`
      );
      if (el) {
        let offsetTop = Helper.documentOffsetTop(el);
        let smallScreenYOffset =
          window.innerWidth < 768 ? (window.innerWidth * 9) / 16 : 0;
        if (!Helper.isInViewport(el, smallScreenYOffset)) {
          let middle =
            offsetTop - window.innerHeight / 2 - smallScreenYOffset / 2;
          window.scrollTo({
            top: middle,
            left: 0,
            // behavior: "smooth",
          });
        }
      }
    },
    goToPreviousLine() {
      this.seekVideoTo(this.previousLine.starttime);
    },
    goToNextLine() {
      this.seekVideoTo(this.nextLine.starttime);
    },
    goToLine(line) {
      this.seekVideoTo(line.starttime)
    },
    rewind() {
      this.seekVideoTo(this.currentLine.starttime);
    },
  },
};
</script>

<style lang="scss">
.transcript.collapsed .transcript-line:nth-child(n + 6) {
  display: none;
}

.transcript.single-line .transcript-line:not(.transcript-line-current) {
  display: none;
}

.transcript-line {
  cursor: pointer;
  position: relative;
  font-size: 1.2rem;
  padding: 0.5rem;
}

.transcript-line-current {
  box-shadow: 0 0 10px rgba(255, 95, 32, 0.301);
  border-radius: 0.25rem;
}

.single-line .transcript-line-current {
  box-shadow: none;
}

.transcript-line.matched {
  color: #616161;
  font-weight: bold;
}

.transcript-title {
  font-weight: bold;
  font-size: 1.5rem;
}

.transcript-line-l1 {
  color: #aaa;
  font-style: italic;
  font-size: 0.8em;
  display: none;
}
.show-translation .transcript-line-l1 {
  display: inherit;
}

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

.review-answer {
  border: 1px solid #999;
}

.review-answer.checked:not(.review-answer-correct) {
  background-color: #dc3838 !important;
  border-color: #a03030 !important;
  color: white !important;
}

.review-answer.checked.review-answer-correct {
  background-color: #63ab67 !important;
  border-color: #36823b !important;
  color: white !important;
}
</style>