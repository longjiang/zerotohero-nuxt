<template>
  <div
    :class="{
      'synced-transcript': true,
      'synced-transcript-multi-line': !single,
      'synced-transcript-single-line': single,
    }"
  >
    <client-only>
      <template
        v-for="(line, index) in single
          ? [lines[currentLineIndex || 0]].filter((line) => line)
          : lines
              .slice(visibleMin, visibleMax - visibleMin)
              .filter((line) => line)"
      >
        <TranscriptLine
          :line="line"
          :parallelLine="
            $l2.code !== $l1.code && parallellines
              ? matchedParallelLines[
                  single ? currentLineIndex : index + visibleMin
                ]
              : undefined
          "
          :lineIndex="index + visibleMin"
          :key="`line-${index + visibleMin}-${
            line.starttime
          }-${line.line.substr(0, 10)}`"
          :abnormal="
            $adminMode &&
            lines[index + visibleMin - 1] &&
            lines[index + visibleMin - 1].starttime > line.starttime
          "
          :matched="
            !single &&
            highlight &&
            line &&
            new RegExp(highlight.join('|')).test(line.line)
          "
          :showSubsEditing="showSubsEditing"
          :sticky="sticky"
          :single="single"
          :highlight="highlight"
          :hsk="hsk"
          :notes="notes"
          :enableTranslationEditing="$adminMode && enableTranslationEditing"
          @click="lineClick(line)"
          @removeLineClick="removeLine(index + visibleMin)"
          @trasnlationLineBlur="trasnlationLineBlur"
          @trasnlationLineKeydown="trasnlationLineKeydown"
        />
        <div v-if="!single" :key="`line-${index + visibleMin}-review`">
          <h6
            class="text-center mt-3"
            :key="`review-title-${index + visibleMin}-${
              reviewKeys[index + visibleMin]
            }`"
            v-if="
              review[index + visibleMin] &&
              review[index + visibleMin].length > 0
            "
          >
            Pop Quiz
            <span
              class="d-inline-block"
              style="position: relative; bottom: 0.13rem"
            >
              <b-button
                class="ml-2"
                style="font-weight: normal"
                v-if="!reviewOpen[index + visibleMin]"
                @click="openReview(index + visibleMin)"
                size="small"
                variant="ghost-dark"
              >
                Open
                <i class="fa fa-chevron-down"></i>
              </b-button>
              <b-button
                class="ml-2"
                style="font-weight: normal"
                v-if="reviewOpen[index + visibleMin] === true"
                @click="closeReview(index + visibleMin)"
                size="small"
                variant="ghost-dark"
              >
                Close
                <i class="fa fa-chevron-up"></i>
              </b-button>
            </span>
          </h6>
          <div v-if="reviewOpen[index + visibleMin] === true">
            <Review
              v-for="(reviewItem, reviewItemIndex) in review[
                index + visibleMin
              ]"
              :key="`review-${index + visibleMin}-${
                reviewItem.text || reviewItem.simplified
              }-${reviewItemIndex}-${reviewKeys[index + visibleMin]}`"
              :reviewItem="reviewItem"
              :hsk="hsk"
              :skin="skin"
            />
          </div>
        </div>
      </template>
      <div
        v-observe-visibility="visibilityChanged"
        style="
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        "
        v-if="!single && lines.length > visibleMax"
      >
        <Loader :sticky="true" />
      </div>
    </client-only>
  </div>
</template>

<script>
import Helper from "@/lib/helper";
import Vue from "vue";

export default {
  props: {
    skin: {
      default: "light",
    },
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
    collapsed: {
      default: false,
    },
    landscape: {
      default: false,
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
      reviewOpen: [],
      neverPlayed: true,
      matchedParallelLines: undefined,
      visibleMin: 0,
      visibleMax: this.startLineIndex ? Number(this.startLineIndex) + 30 : 30,
      visibleRange: 30,
      preventJumpingAtStart: typeof this.startLineIndex !== "undefined",
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
      if (this.preventJumpingAtStart) {
        this.turnOffPreventJumptingAtStartAfter3Seconds();
      }
      let progressType = this.checkProgress();
      if (
        progressType === "jump" &&
        typeof this.startLineIndex !== "undefined" &&
        this.preventJumpingAtStart
      )
        return;
      if (progressType === "first play") {
        if (this.currentTime >= this.lines[0].starttime) {
          this.playNearestLine();
        }
      } else if (progressType === "within current line") {
        // do nothing
      } else if (progressType === "advance to next line") {
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
      if (!this.single) this.scrollTo(this.currentLineIndex);
    },
    currentLineIndex() {
      let visibleMax = Math.max(
        this.visibleMax,
        this.currentLineIndex + this.visibleRange
      );
      if (visibleMax > this.visibleMax + this.visibleRange / 2) {
        this.visibleMax = visibleMax;
      }
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
    openReview(index) {
      Vue.set(this.reviewOpen, index, true);
    },
    closeReview(index) {
      Vue.set(this.reviewOpen, index, undefined);
    },
    async turnOffPreventJumptingAtStartAfter3Seconds() {
      await Helper.timeout(3000);
      this.preventJumpingAtStart = false;
    },
    visibilityChanged(isVisible) {
      if (isVisible) {
        this.visibleMax = this.visibleMax + this.visibleRange;
      }
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
        this.$emit("updateTranslation", updatedLines);
      }
    },
    /**
     * Match parallel lines (translation lines) to L2 lines.
     */
    matchParallelLines() {
      let matchedParallelLines = [];
      for (let lineIndex in this.lines) {
        lineIndex = Number(lineIndex);
        let line = this.lines[lineIndex];
        let nextLine = this.lines[lineIndex + 1];
        // Assign parallel lines to this line if the parallel line starts before
        matchedParallelLines[lineIndex] = this.parallellines
          .filter((parallelLine, parallelLineIndex) => {
            if (!parallelLine) return false;
            let nextParallelLine = this.parallellines[parallelLineIndex + 1];
            let medianTime = nextParallelLine
              ? (parallelLine.starttime + nextParallelLine.starttime) / 2
              : parallelLine.starttime + 2;
            if (medianTime >= line.starttime) {
              if (!nextLine) return true;
              else return medianTime <= nextLine.starttime;
            }
          })
          .map((l) => l.line)
          .join(" ");
        if (!nextLine) break;
      }
      this.matchedParallelLines = matchedParallelLines;
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
          (typeof this.lines[lineIndex + 1] === "undefined" ||
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
    removeLine(lineIndex) {
      this.lines.splice(lineIndex, 1);
      if (this.matchedParallelLines)
        this.matchedParallelLines.splice(lineIndex, 1);
      this.emitUpdateTranslation();
    },
    /**
     * Generate review items during initial load.
     */
    async generateReview() {
      let review = {};
      let affectedLineNumbers = [];
      for (let savedWord of this.$store.state.savedWords.savedWords[
        this.$l2.code
      ]) {
        let word = await (await this.$getDictionary()).get(savedWord.id);
        if (word) {
          let lineNumbers = await this.addReviewItemsForWord(
            word,
            savedWord.forms,
            review
          );
          affectedLineNumbers = affectedLineNumbers.concat(lineNumbers);
        }
      }
      this.updateKeysForLines(affectedLineNumbers);
      return review;
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
    async addReviewItemsForWord(word, wordForms, review) {
      let lineOffset = this.reviewLineOffset;
      let affectedLineNumbers = [];
      let forms = wordForms.filter((form) => form && form !== "-");
      forms = Helper.uniqueIgnoreCase(forms);
      for (let form of forms.sort((a, b) => b.length - a.length)) {
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
            affectedLineNumbers.push(reviewIndex);
            this.reviewKeys[reviewIndex]++;
          }
        }
      }
      return affectedLineNumbers;
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
    seekVideoTo(starttime) {
      this.$emit("seek", starttime);
    },
    getSmallScreenOffset() {
      let smallScreenOffset;
      if (!this.landscape) {
        let controllerHeight = 52;
        if (this.collapsed) {
          smallScreenOffset = videoHeight;
        } else {
          let transcriptContainerWidth = this.$el.clientWidth;
          let videoHeight = (transcriptContainerWidth * 9) / 16; // video height, hidden if collapsed
          smallScreenOffset = videoHeight + controllerHeight;
        }
      } else {
        smallScreenOffset = 0;
      }
      return smallScreenOffset;
    },
    scrollTo(lineIndex) {
      let el = this.$el.querySelector(
        `.transcript-line[data-line-index="${lineIndex}"]`
      );
      if (el) {
        let smallScreenYOffset = this.getSmallScreenOffset();
        let elHeight = el.clientHeight;
        let lastDuration =
          this.previousLine && this.currentLine
            ? (this.currentLine.starttime - this.previousLine.starttime) * 1000
            : 2000;
        lastDuration = lastDuration || 2000;
        let duration =
          this.currentLine && this.nextLine
            ? Math.min(
                (this.nextLine.starttime - this.currentLine.starttime) * 1000,
                lastDuration
              )
            : 2000;
        this.$smoothScroll({
          scrollTo: el,
          updateHistory: false,
          offset:
            -(smallScreenYOffset
              ? window.innerHeight + smallScreenYOffset
              : (this.$el.clientWidth * 9) / 16 + 52) /
              2 +
            elHeight / 2,
          duration,
          left: 0,
          easingFunction: (t) => t,
        });
      }
    },
    lineClick(line) {
      if (this.showSubsEditing) {
        this.adjustAllLinesBelowToMatchCurrentTime(line);
      } else if (!this.enableTranslationEditing) {
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
      if (!line) return;
      this.currentLineIndex = this.lines.findIndex((l) => l === line);
      this.currentLine = line;
      this.nextLine = this.lines[this.currentLineIndex + 1];
      this.seekVideoTo(line.starttime - 0.2); // We rewind to 200ms earlier to capture more audio at the beginning of the line
    },
    rewind() {
      this.goToLine(this.currentLine);
    },
  },
};
</script>

<style lang="scss" scoped>
.synced-transcript {
  .transcript-title {
    font-weight: bold;
    font-size: 1.5rem;
  }
  &.synced-transcript-multi-line {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>