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
      <template
        v-for="(line, lineIndex) in single
          ? [lines[currentLineIndex || 0]]
          : lines"
      >
        <div
          :key="`line-${lineIndex}-${line.starttime}-${line.line.substr(
            0,
            10
          )}`"
          :class="{
            'transcript-line': true,
            'transcript-line-abnormal':
              $adminMode &&
              lines[lineIndex - 1] &&
              lines[lineIndex - 1].starttime > line.starttime,
            matched:
              !single &&
              highlight &&
              line &&
              new RegExp(highlight.join('|')).test(line.line),
            'pl-4': !single && $l2.direction !== 'rtl',
            'pr-4': !single && $l2.direction === 'rtl',
          }"
          @click="lineClick(line)"
          :data-line-index="lineIndex"
          style="display: flex"
          ref="lines"
        >
          <div v-if="!single && showSubsEditing" class="mr-3">
            <div style="font-size: 0.7em; color: #ccc">
              {{ Math.round(line.starttime * 100) / 100 }}
            </div>
            <b-button
              class="btn btn-small bg-danger text-white"
              @click="removeLine(lineIndex)"
            >
              <i class="fa fa-trash"></i>
            </b-button>
          </div>
          <div style="flex: 1">
            <Annotate
              tag="div"
              :sticky="sticky"
              :class="{
                'transcript-line-chinese': true,
                'text-center': single,
                'pr-3': single && $l2.direction === 'rtl',
                'pl-3': single && $l2.direction !== 'rtl',
              }"
              :buttons="true"
              v-if="!showSubsEditing"
              @textChanged="lineChanged(line, ...arguments)"
            >
              <span v-html="lineHtml(line)" />
            </Annotate>
            <div v-else v-html="lineHtml(line)" />
            <div
              v-if="$l2.code !== $l1.code && parallellines"
              :class="{
                'transcript-line-l1': true,
                'pl-3': !single && $l2.direction === 'ltr',
                'pr-3': !single && $l2.direction === 'rtl',
                'text-right':
                  $l2.scripts &&
                  $l2.scripts.length > 0 &&
                  $l2.scripts[0].direction === 'rtl',
                'text-center': single,
              }"
              v-html="
                matchedParallelLines[single ? currentLineIndex : lineIndex]
              "
              :contenteditable="$adminMode && enableTranslationEditing"
              :data-line-index="lineIndex"
              @blur.capture="trasnlationLineBlur"
              @keydown.capture="trasnlationLineKeydown"
            ></div>
          </div>
        </div>
        <div v-if="!single" :key="`review-${lineIndex}`">
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
import Vue from "vue";

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
      type: Array,
    },
    notes: {
      type: Array,
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
      default: undefined,
    },
    stopLineIndex: {
      default: -1,
    },
    showSubsEditing: {
      default: false,
    },
    enableTranslationEditing: {
      default: false,
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
      currentLineIndex: undefined,
      reviewLineOffset: 10, // Show review this number of lines after the first appearance of the word
      nextLine: undefined,
      review: {},
      paused: true,
      ended: false,
      audioMode: false,
      repeatMode: false,
      audioCancelled: false,
      reviewKeys: [],
      neverPlayed: true,
      matchedParallelLines: undefined,
    };
  },
  async created() {
    this.lines.map((line) => {
      line.starttime = Number(line.starttime);
    });
    if (this.parallellines) this.matchParallelLines();
    this.reviewKeys = this.lines.map(() => 0);
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
    if (this.startLineIndex) {
      let startLineIndex = Number(this.startLineIndex);
      this.currentLine = this.lines[startLineIndex];
      this.currentLineIndex = startLineIndex;
      this.nextLine = this.lines[startLineIndex + 1];
    }
  },
  beforeDestroy() {
    if (this.unsubscribe) this.unsubscribe();
  },
  watch: {
    async currentTime() {
      let progressType = this.checkProgress();
      if (progressType === "first play") {
        if (this.currentTime >= this.lines[0].starttime) {
          this.playNearestLine();
        }
      } else if (progressType === "within current line") {
        // do nothing
      } else if (progressType === "advance to next line") {
        // console.log(progressType);
        let progress = this.currentTime - this.previousTime;
        if (this.repeatMode) {
          if (progress > 0 && progress < 0.15) {
            this.rewind();
          }
        } else {
          this.currentLine = this.nextLine;
          this.currentLineIndex = this.currentLineIndex + 1;
          this.nextLine = this.lines[this.currentLineIndex + 1];
        }
        if (!this.paused && this.audioMode) this.doAudioModeStuff();
      } else if (progressType === "jump") {
        this.playNearestLine();
      }
      this.previousTime = this.currentTime;
    },
    currentLine() {
      if (!this.single && this.currentLineIndex !== 0)
        this.scrollTo(this.currentLineIndex);
    },
    currentLineIndex() {
      let lineEls = this.$el.querySelectorAll(`.transcript-line`);
      lineEls.forEach((lineEl) =>
        lineEl.classList.remove("transcript-line-current")
      );
      let lineEl = this.$el.querySelector(
        `.transcript-line[data-line-index="${this.currentLineIndex}"]`
      );
      if (lineEl) lineEl.classList.add("transcript-line-current");
    },
    parallellines() {
      if (this.parallellines) this.matchParallelLines();
    },
  },
  methods: {
    lineChanged(line, newText) {
      line.line = newText;
    },
    trasnlationLineBlur(e) {
      this.trasnlationLineChanged(e);
    },
    async trasnlationLineKeydown(e) {
      if (e.key === "Enter") {
        await Helper.timeout(100);
        this.trasnlationLineChanged(e);
        this.goToNextLine();
      }
    },
    trasnlationLineChanged(e) {
      let lineIndex = Number(e.target.getAttribute("data-line-index"));
      for (let line of this.matchedParallelLines) {
        line = line.replace(/\n/g, " ");
      }
      this.matchedParallelLines[lineIndex] = e.target.innerText;
      this.emitUpdateTranslation();
    },
    emitUpdateTranslation() {
      if (this.matchedParallelLines) {
        let updatedLines = this.matchedParallelLines
          .filter((l) => l !== "")
          .join("\n")
          .replace(/\n+/gm, "\n")
          .trim();
        console.log(updatedLines)
        this.$emit("updateTranslation", updatedLines);
      }
    },
    matchParallelLines() {
      let matchedParallelLines = [];
      for (let lineIndex in this.lines) {
        lineIndex = Number(lineIndex);
        let line = this.lines[lineIndex];
        let nextLine = this.lines[lineIndex + 1];
        matchedParallelLines[lineIndex] = this.parallellines
          .filter((l) => {
            return (
              l &&
              l.starttime >= line.starttime - 0.5 &&
              (!nextLine || l.starttime < nextLine.starttime - 0.5)
            );
          })
          .map((l) => l.line)
          .join(" ");
        if (!nextLine) break;
      }
      this.matchedParallelLines = matchedParallelLines;
    },
    lineHtml(line) {
      let html = this.smartquotes(line.line);
      if (this.highlight)
        html = this.highlightMultiple(
          html,
          this.highlight,
          this.hsk || "outside"
        );
      html = html.replace(/\[(\d+)\]/g, (_, num) => {
        let note;
        if (this.notes) {
          note = this.notes.find((note) => note.id === Number(num));
        }
        return `<PopupNote :number="${num}" content="${
          note ? note.note : ""
        }"></PopupNote>`;
      });
      return html;
    },
    checkProgress() {
      if (!this.currentLine) {
        return "first play";
      } else if (
        this.currentTime > this.currentLine.starttime - 1 &&
        (!this.nextLine ||
          (this.nextLine && this.currentTime < this.nextLine.starttime))
      ) {
        return "within current line";
      } else if (
        this.nextLine &&
        this.currentTime > this.nextLine.starttime - 0.15 &&
        this.currentTime < this.nextLine.starttime + 0.15
      ) {
        return "advance to next line";
      } else {
        return "jump";
      }
    },
    nearestLineIndex(time) {
      let nearestLineIndex = undefined;
      for (let lineIndex in this.lines) {
        lineIndex = Number(lineIndex);
        if (
          this.lines[lineIndex].starttime <= time &&
          this.lines[lineIndex + 1] &&
          (!this.lines[lineIndex + 1] ||
            time < this.lines[lineIndex + 1].starttime)
        ) {
          nearestLineIndex = lineIndex;
          break;
        }
      }
      return nearestLineIndex;
    },
    playNearestLine() {
      let nearestLineIndex = this.nearestLineIndex(this.currentTime);
      if (typeof nearestLineIndex !== "undefined") {
        let nearestLine = this.lines[nearestLineIndex];
        this.currentLine = nearestLine;
        this.currentLineIndex = nearestLineIndex;
        this.nextLine = this.lines[nearestLineIndex + 1];
        if (!this.paused && this.audioMode) this.doAudioModeStuff();
      } else {
        this.currentLine = undefined;
        this.currentLineIndex = undefined;
        this.nextLine = undefined;
      }
    },
    async doAudioModeStuff() {
      if (!this.currentLineIndex) {
        this.currentTime = this.currentTime + 0.1;
      }
      // console.log("🍉 started do audio stuff");
      this.$emit("pause");
      this.audioCancelled = false;
      if (
        this.matchedParallelLines &&
        this.matchedParallelLines[this.currentLineIndex]
      ) {
        // await Helper.timeout(1000);
        this.$emit("speechStart");
        let englishPromise = Helper.speak(
          this.matchedParallelLines[this.currentLineIndex],
          this.$l1,
          1.1
        );
        // console.log(englishPromise, "englishPromise");
        await englishPromise;
        // console.log("🇺🇸 english finished");
      }
      if (!this.audioCancelled && !window.speechSynthesis.speaking) {
        if (this.currentLine) {
          // await Helper.timeout(1000);
          // console.log("🇯🇵 japanese finished");
          this.$emit("speechStart");
          let japanesePromise = Helper.speak(
            this.currentLine.line,
            this.$l2,
            1
          );
          // console.log(japanesePromise, "japanesePromise");
          await japanesePromise;
          // console.log("🇯🇵 japanese finished");
          // console.log("📺 resuming");
          if (this.quiz && this.review[this.currentLineIndex]) {
            await Helper.speak(
              "Please complete the pop quiz",
              this.$l1,
              1.1,
              0.2
            );
          } else {
            this.$emit("play");
          }
          this.$emit("speechEnd");
        }
      }
    },
    stopAudioModeStuff() {
      // console.log("🤚 stopping audio stuff");
      this.audioCancelled = true;
      window.speechSynthesis.cancel();
      this.$emit("speechEnd");
      this.$emit("pause");
    },
    async decodeHtmlEntities(text) {
      const HTMLEntities = await import("html-entities");
      const allEntities = new HTMLEntities.AllHtmlEntities();
      return allEntities.decode(text);
    },
    highlightMultiple() {
      return Helper.highlightMultiple(...arguments);
    },
    smartquotes(text) {
      return SmartQuotes.string(text);
    },
    removeLine(lineIndex) {
      this.lines.splice(lineIndex, 1);
      if (this.matchedParallelLines)
        this.matchedParallelLines.splice(lineIndex, 1);
      this.emitUpdateTranslation();
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
        this.updateKeysForLines(affectedLines);
      } else if (mutation.type === "savedWords/REMOVE_SAVED_WORD") {
        let affectedLines = this.removeReviewItemsForWord(
          mutation.payload.word,
          this.review
        );
        this.updateKeysForLines(affectedLines);
      }
    },
    async generateReview() {
      let review = {};
      let affectedLines = [];
      for (let savedWord of this.$store.state.savedWords.savedWords[
        this.$l2.code
      ]) {
        let word = await (await this.$getDictionary()).get(savedWord.id);
        if (word) {
          affectedLines = affectedLines.concat(
            await this.addReviewItemsForWord(word, savedWord.forms, review)
          );
        }
      }
      this.updateKeysForLines(affectedLines);
      return review;
    },
    updateKeysForLines(affectedLines) {
      for (let lineIndex in this.reviewKeys) {
        if (affectedLines.includes(Number(lineIndex))) {
          Vue.set(this.reviewKeys, lineIndex, this.reviewKeys[lineIndex] + 1);
        }
      }
    },
    removeReviewItemsForWord(word, review) {
      let affectedLines = [];
      for (let reviewIndex in review) {
        let length = review[reviewIndex].length;
        review[reviewIndex] = review[reviewIndex].filter(
          (reviewItem) => word.id !== reviewItem.word.id
        );
        if (review[reviewIndex].length < length)
          affectedLines.push(reviewIndex);
      }
      return affectedLines;
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
      return affectedLines;
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
        answers: Helper.shuffle(answers),
      };
    },
    seekVideoTo(starttime) {
      this.$emit("seek", starttime);
    },
    scrollTo(lineIndex) {
      let el = this.$el.querySelector(
        `.transcript-line[data-line-index="${lineIndex}"]`
      );
      if (el) {
        let smallScreenYOffset =
          window.innerHeight > window.innerWidth
            ? (window.innerWidth * 9) / 16 + 52 // controller height
            : 0;
        if (!Helper.isInViewport(el, smallScreenYOffset, 0)) {
          let offsetTop = Helper.documentOffsetTop(el);
          let middle = offsetTop - smallScreenYOffset - 10;
          window.scrollTo({
            top: middle,
            left: 0,
            behavior: "smooth",
          });
        }
      }
    },
    lineClick(line) {
      if (this.showSubsEditing) {
        this.adjustAllLinesBelowToMatchCurrentTime(line);
      } else {
        this.goToLine(line);
      }
    },
    adjustAllLinesBelowToMatchCurrentTime(line) {
      let delta = 0;
      let currentLine = line;
      let currentLineIndex = this.lines.findIndex((l) => l === line);
      for (let lineIndex in this.lines) {
        lineIndex = Number(lineIndex);
        let line = this.lines[lineIndex];
        if (lineIndex === currentLineIndex) {
          delta = this.currentTime - currentLine.starttime;
          Vue.set(line, "starttime", this.currentTime);
        } else if (lineIndex > currentLineIndex) {
          Vue.set(line, "starttime", (line.starttime += delta));
        }
      }
      this.currentLine = currentLine;
      this.currentLineIndex = currentLineIndex;
    },
    goToPreviousLine() {
      this.goToLine(this.previousLine || this.lines[0]);
    },
    goToNextLine() {
      this.goToLine(this.nextLine || this.lines[0]);
    },
    goToLine(line) {
      this.currentLineIndex = this.lines.findIndex(l => l === line)
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

.transcript-line-abnormal {
  background-color: lightpink;
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