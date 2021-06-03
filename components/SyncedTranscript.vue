<template>
  <div class="synced-transcript">
    <div
      :class="{
        transcript: true,
        collapsed: collapse,
        'single-line': single,
      }"
      data-collapse-target
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
            v-if="$adminMode"
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
                  ? highlightMultiple(line.line, highlight, hsk || 'outside')
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
        <div
          v-if="review[lineIndex] && review[lineIndex].length > 0"
          :key="`review-${lineIndex}-${reviewKeys[lineIndex]}`"
        >
          <h6 class="text-center mt-3">Pop Quiz</h6>
          <Review
            v-for="(reviewItem, reviewItemIndex) in review[lineIndex]"
            :key="`review-${lineIndex}-${reviewKeys[lineIndex]}-${reviewItemIndex}`"
            :reviewItem="reviewItem"
            :hsk="hsk"
            :parallellines="parallellines || []"
          />
        </div>
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
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
    previousLine() {
      let previousIndex = Math.max(this.currentLineIndex - 1, 0);
      return this.lines && this.lines[previousIndex]
        ? this.lines[previousIndex]
        : false;
    },
  },
  data() {
    return {
      sW: [],
      id: Helper.uniqueId(),
      previousTime: 0,
      currentTime: 0,
      currentLine: undefined,
      currentLineIndex: 0,
      nextLine: undefined,
      review: {},
      paused: true,
      ended: false,
      repeat: false,
      reviewKeys: [],
      neverPlayed: true,
    };
  },
  created() {
    this.lines.map((line) => {
      line.starttime = Number(line.starttime);
    });
    this.currentLine =
      this.lines && this.lines[this.startLineIndex]
        ? this.lines[this.startLineIndex]
        : undefined;
    this.reviewKeys = this.lines.map((line) => 0);
    if (this.highlightSavedWords) this.updateReview();
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("savedWords")) {
        this.updateReview();
      }
    });
  },
  beforeDestroy() {
    // you may call unsubscribe to stop the subscription
    this.unsubscribe();
  },
  // updated() {
  //   if (!this.single) this.scrollTo(this.currentLineIndex);
  // },
  watch: {
    currentTime() {
      if (
        this.currentTime > this.currentLine.starttime &&
        this.nextLine &&
        this.currentTime < this.nextLine.starttime
      ) {
        return;
      }
      let nearestLineIndex = this.nearestLineIndex(this.currentTime);
      let nearestLine = this.lines[nearestLineIndex];
      let progress = this.currentTime - this.previousTime;
      if (
        this.repeat &&
        this.currentLine !== nearestLine &&
        progress > 0 &&
        progress < 0.15
      )
        this.rewind();
      else {
        this.currentLine = nearestLine;
        this.currentLineIndex = nearestLineIndex;
        this.nextLine = this.lines[nearestLineIndex + 1];
      }
      this.previousTime = this.currentTime;
    },
    currentLine() {
      if (!this.single) this.scrollTo(this.currentLineIndex);
    },
  },
  methods: {
    highlightMultiple() {
      return Helper.highlightMultiple(...arguments);
    },
    incrementReviewKeyAfterLine(lineIndex) {
      // for (let index in this.lines) {
      //   if (index >= lineIndex) {
      //     if (this.reviewKeys[lineIndex]) this.reviewKeys[lineIndex]++
      //   }
      // }
    },
    nearestLineIndex(time) {
      let nearestLineIndex = 0;
      for (let lineIndex in this.lines) {
        if (this.lines[lineIndex].starttime > time) {
          break;
        } else {
          nearestLineIndex = lineIndex;
        }
      }
      return Number(nearestLineIndex);
    },
    removeLine(lineIndex) {
      this.lines.splice(lineIndex, 1);
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
      let review = Object.assign({}, this.review);
      let lineOffset = 10; // Show review this number of lines after the first appearance of the word
      for (let lineIndex in this.lines) {
        if (
          lineIndex >=
          Math.ceil((Number(this.currentLineIndex) + lineOffset) / 10) * 10
        )
          delete review[lineIndex];
      }
      if (
        this.quiz &&
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
              for (
                let lineIndex = this.currentLineIndex;
                lineIndex < this.lines.length;
                lineIndex++
              ) {
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
                      lineIndex: lineIndex,
                      text: form,
                      word: word,
                      simplified: word.simplified,
                      traditional: word.traditional,
                      answers: Helper.shuffle(answers),
                    });
                    seenLines.push(lineIndex);
                  }
                }
                this.reviewKeys[lineIndex]++;
              }
            }
          }
        }
      }
      this.review = review;
      this.incrementReviewKeyAfterLine(this.currentLineIndex);
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
      this.seekVideoTo(line.starttime);
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
</style>