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
          :key="`line-${lineIndex}-${line.starttime}-${line.line.substr(
            0,
            10
          )}`"
          :class="{
            'transcript-line': true,
            matched:
              !single &&
              highlight &&
              line &&
              new RegExp(highlight.join('|')).test(line.line),
            'transcript-line-current': currentLine === line,
          }"
          @click="goToLine(line)"
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
            :class="{ 'transcript-line-chinese': true, 'pl-3': !single }"
            :buttons="true"
          >
            <span
              v-html="
                highlight
                  ? highlightMultiple(
                      smartquotes(line.line),
                      highlight,
                      hsk || 'outside'
                    )
                  : smartquotes(line.line)
              "
            />
          </Annotate>
          <div
            v-if="$l2.code !== $l1.code && parallellines"
            :class="{
              'transcript-line-l1': true,
              'pl-3': !single,
              'text-right':
                $l2.scripts &&
                $l2.scripts.length > 0 &&
                $l2.scripts[0].direction === 'rtl',
            }"
            v-html="matchedParallelLines[lineIndex]"
          ></div>
        </div>
        <div :key="`review-${lineIndex}`">
          <h6
            class="text-center mt-3"
            :key="`review-title-${lineIndex}-${reviewKeys[lineIndex]}`"
            v-if="review[lineIndex] && review[lineIndex].length > 0"
          >
            Pop Quiz
          </h6>
          <Review
            v-for="(reviewItem, reviewItemIndex) in review[lineIndex]"
            :key="`review-${lineIndex}-${reviewItemIndex}-${reviewKeys[lineIndex]}`"
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
import SmartQuotes from "smartquotes";
import Vue from 'vue'

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
      default: () => [],
    },
    parallellines: {
      type: Array,
      default: () => [],
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
      currentLine: 0,
      currentLineIndex: 0,
      reviewLineOffset: 10, // Show review this number of lines after the first appearance of the word
      nextLine: undefined,
      review: {},
      paused: true,
      ended: false,
      repeat: false,
      reviewKeys: [],
      neverPlayed: true,
    };
  },
  async created() {
    this.lines.map((line) => {
      line.starttime = Number(line.starttime);
    });
    let matchedParallelLines = [];
    for (let lineIndex in this.lines) {
      lineIndex = Number(lineIndex);
      let line = this.lines[lineIndex];
      let nextLine = this.lines[lineIndex + 1];
      if (!nextLine) break;
      matchedParallelLines[lineIndex] = this.parallellines
        .filter((l) => {
          return (
            l.starttime >= line.starttime - 1 &&
            (!nextLine || l.starttime < nextLine.starttime - 1)
          );
        })
        .map((l) => l.line)
        .join("&nbsp;");
    }
    this.matchedParallelLines = matchedParallelLines;

    this.currentLine =
      this.lines && this.lines[this.startLineIndex]
        ? this.lines[this.startLineIndex]
        : undefined;
    this.reviewKeys = this.lines.map((line) => 0);
    if (this.quiz && this.highlightSavedWords) {
      if (
        this.$store.state.savedWords.savedWords &&
        this.$store.state.savedWords.savedWords[this.$l2.code]
      ) {
        this.review = await this.generateReview();
      }
      this.unsubscribe = this.$store.subscribe((mutation, state) => {
        if (mutation.type.startsWith("savedWords")) {
          this.updateReview(mutation);
        }
      });
    }
  },
  beforeDestroy() {
    if (this.unsubscribe) this.unsubscribe();
  },
  watch: {
    currentTime() {
      if (
        this.currentTime > this.currentLine.starttime - 0.15 &&
        this.nextLine &&
        this.currentTime < this.nextLine.starttime
      ) {
        this.previousTime = this.currentTime;
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
      if (!this.single && this.currentLineIndex !== 0)
        this.scrollTo(this.currentLineIndex);
    },
  },
  methods: {
    highlightMultiple() {
      return Helper.highlightMultiple(...arguments);
    },
    smartquotes(text) {
      return SmartQuotes.string(text.replace(/&#39;/g, "'"));
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
    async updateReview(mutation) {
      if (mutation.type === "savedWords/ADD_SAVED_WORD") {
        let affectedLines = await this.addReviewItemsForWord(
          mutation.payload.word,
          mutation.payload.wordForms,
          this.review
        );
        this.updateKeysForLines(affectedLines) 
      } else if (mutation.type === "savedWords/REMOVE_SAVED_WORD") {
        let affectedLines = this.removeReviewItemsForWord(mutation.payload.word, this.review);
        this.updateKeysForLines(affectedLines) 
      }
    },
    async generateReview() {
      let review = {};
      let affectedLines = []
      for (let savedWord of this.$store.state.savedWords.savedWords[
        this.$l2.code
      ]) {
        let word = await (await this.$getDictionary()).get(savedWord.id);
        if (word) {
          affectedLines = affectedLines.concat(await this.addReviewItemsForWord(word, savedWord.forms, review));
          
        }
      }
      this.updateKeysForLines(affectedLines) 
      return review;
    },
    updateKeysForLines(affectedLines) {
      for (let lineIndex in this.reviewKeys) {
        if (affectedLines.includes(Number(lineIndex))) {
          Vue.set(this.reviewKeys, lineIndex, this.reviewKeys[lineIndex] + 1)
        }
      }
    },
    removeReviewItemsForWord(word, review) {
      let affectedLines = []
      for (let reviewIndex in review) {
        let length = review[reviewIndex].length;
        review[reviewIndex] = review[reviewIndex].filter(
          (reviewItem) => word.id !== reviewItem.word.id
        );
        if (review[reviewIndex].length < length) affectedLines.push(reviewIndex);
      }
      return affectedLines
    },
    async addReviewItemsForWord(word, wordForms, review) {
      let lineOffset = this.reviewLineOffset;
      let affectedLines = [];
      for (let form of wordForms
        .filter((form) => form && form !== "-")
        .sort((a, b) => b.length - a.length)) {
        for (let lineIndex in this.lines) {
          if (this.reviewConditions(lineIndex, form, word)) {
            let reviewItem = await this.generateReviewItem(
              lineIndex,
              form,
              word
            );
            let reviewIndex = Math.min(
              Math.ceil((Number(lineIndex) + lineOffset) / 10) * 10,
              this.lines.length - 1
            );
            review[reviewIndex] = review[reviewIndex] || [];
            review[reviewIndex].push(reviewItem);
            affectedLines.push(reviewIndex);
            this.reviewKeys[reviewIndex]++;
          }
        }
      }
      return affectedLines
    },
    reviewConditions(lineIndex, form, word) {
      let line = this.lines[lineIndex];
      if (["en", "ru"].includes(this.$l2.code)) {
        return line.line.includes(form);
      }
      if (this.$l2.continua && line.line.includes(form)) return true;
      if (
        this.$l2.han &&
        (line.line.includes(word.simplified) ||
          line.line.includes(word.traditional))
      )
        return true;
      if (!this.$l2.continua) {
        return (
          new RegExp(`[ .,:!?]${form}[ .,:!?]`, "gi").test(line.line) ||
          new RegExp(`^${form}[ .,:!?]`, "gi").test()
        );
      }
    },
    async generateReviewItem(lineIndex, form, word) {
      let line = this.lines[lineIndex];
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
      let parallelLines = this.matchedParallelLines[lineIndex];
      return {
        line,
        lineIndex,
        parallelLines,
        text: form,
        word,
        simplified: word.simplified,
        traditional: word.traditional,
        answers: Helper.shuffle(answers),
      };
    },
    seekVideoTo(starttime) {
      this.$emit("seek", starttime);
    },
    scrollTo(lineIndex) {
      let el = document.getElementById(
        `transcript-line-${this.id}-${lineIndex}`
      );
      if (el) {
        let offsetTop = Helper.documentOffsetTop(el);
        let smallScreenYOffset =
          window.innerWidth < 768 ? (window.innerWidth * 9) / 16 : 0;
        if (!Helper.isInViewport(el, smallScreenYOffset, 90)) {
          let middle = offsetTop - smallScreenYOffset - 20;
          window.scrollTo({
            top: middle,
            left: 0,
            behavior: "smooth",
          });
        }
      }
    },
    goToPreviousLine() {
      this.goToLine(this.previousLine);
    },
    goToNextLine() {
      this.goToLine(this.nextLine);
    },
    goToLine(line) {
      this.seekVideoTo(line.starttime);
    },
    rewind() {
      this.goToLine(this.currentLine);
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
  color: #bbb;
  font-size: 0.7em;
  display: none;
}

.show-translation .transcript-line-l1 {
  display: inherit;
}
</style>