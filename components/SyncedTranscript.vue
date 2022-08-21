<template>
  <div
    :class="{
      'synced-transcript': true,
      'synced-transcript-multi-line': !single,
      'synced-transcript-single-line': single,
    }"
  >
    <client-only>
      <div class="transcript-wrapper">
        <client-only>
          <template
            v-for="(line, index) in filteredLines.slice(
              this.visibleMin,
              this.visibleMax - this.visibleMin
            )"
          >
            <TranscriptLine
              v-bind="{
                line,
                showSubsEditing,
                showAnimation,
                sticky,
                single,
                hsk,
                notes,
                textSize: single ? textSize : 1,
                parallelLine: getParallelLine(line, index),
                showParallelLine: parallellines && parallellines.length > 0,
                lineIndex: index + visibleMin,
                current: currentLine === line,
                hideWhileAnnotating: single,
                enableTranslationEditing:
                  $adminMode && enableTranslationEditing,
                abnormal:
                  $adminMode &&
                  lines[index + visibleMin - 1] &&
                  lines[index + visibleMin - 1].starttime > line.starttime,
                duration: line.duration
                  ? line.duration
                  : lines[single ? currentLineIndex + 1 : index + 1]
                  ? lines[single ? currentLineIndex + 1 : index + 1].starttime -
                    line.starttime
                  : 5,
              }"
              :key="`line-${index + visibleMin}-${
                line.starttime
              }-${line.line.substr(0, 10)}`"
              :ref="`${single ? 'transcript-line' : 'transcript-line-'}${
                !single ? index + visibleMin : ''
              }`"
              @click="lineClick(line)"
              @removeLineClick="removeLine(index + visibleMin)"
              @trasnlationLineBlur="trasnlationLineBlur"
              @trasnlationLineKeydown="trasnlationLineKeydown"
            />
            <PopQuiz
              v-if="quizChunks[index]"
              :key="`pop-quiz-${index}`"
              :lines="lines"
              :quizContent="
                quizChunks[index]
                  .filter((i) => $refs[`transcript-line-${i + visibleMin}`])
                  .map((i) => $refs[`transcript-line-${i + visibleMin}`][0])
              "
            />
          </template>
          <div
            v-observe-visibility="visibilityChanged"
            style="
              height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            "
            v-if="!single && filteredLines.length > visibleMax"
          >
            <Loader :sticky="true" />
          </div>
          <template v-if="!pro">
            <YouNeedPro
              v-if="
                (!single && filteredLines.length < lines.length) ||
                (single && currentLineIndex > NON_PRO_MAX_LINES - 7)
              "
              style="position: absolute; bottom: 0; width: 100%"
            />
          </template>
        </client-only>
      </div>
      <EndQuiz
        v-if="!single"
        :lines="lines"
        :matchedParallelLines="matchedParallelLines"
        :hsk="hsk"
        :skin="skin"
      />
    </client-only>
  </div>
</template>

<script>
import Helper from "@/lib/helper";
import Vue from "vue";

import { NON_PRO_MAX_LINES, POPULAR_LANGS } from "@/lib/config";
const CURRENT_LINE_STARTED_TOLERANCE = 1; // seconds
const NEXT_LINE_STARTED_TOLERANCE = 0.15; // seconds

export default {
  props: {
    skin: {
      default: "light",
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
    showAnimation: {
      default: true,
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
    textSize: {
      default: 1
    },
    forcePro: {
      default: false,
    },
    autoPause: {
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
      nextLine: undefined,
      paused: true,
      ended: false,
      audioMode: false,
      repeatMode: false,
      audioCancelled: false,
      neverPlayed: true,
      matchedParallelLines: undefined,
      visibleMin: 0,
      visibleMax: this.startLineIndex ? Number(this.startLineIndex) + 30 : 30,
      visibleRange: 30,
      autoPausedLineIndex: undefined,
      preventJumpingAtStart: typeof this.startLineIndex !== "undefined",
      useSmoothScroll: false,
      NON_PRO_MAX_LINES,
    };
  },
  computed: {
    /**
     * A map of line indices after which to show a pop quiz to the lines this quiz is based on.
     * Key is the transcript line number (starting from 0) after which the quiz is shown
     * Values are the transcript line indices on which the quiz is based
     */
    quizChunks() {
      let quizChunks = {};
      let seenLineIndices = [];
      let lastIndex = 0;
      let MIN_SEPARATION = 10; // minimum number of lines that separate two quizzes
      for (let index in this.lines) {
        index = Number(index);
        seenLineIndices.push(index);
        if (
          this.longPauseAfterLine(index) ||
          index > lastIndex + MIN_SEPARATION * 2
        ) {
          if (index > lastIndex + MIN_SEPARATION) {
            quizChunks[index + 1] = seenLineIndices; // Quiz the lines at the next checkpoint
            seenLineIndices = [];
            lastIndex = index;
          }
        }
      }
      return quizChunks;
    },
    pro() {
      if (this.forcePro) return true;
      if (!POPULAR_LANGS.includes(this.$l2.code)) return true; // Let's not charge for less popular languages
      return [1, 4].includes(Number(this.$auth.user?.role)) ? true : false;
    },
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
    filteredLines() {
      let filteredLines = this.lines;
      if (!this.pro && !this.forcePro)
        filteredLines = filteredLines.slice(0, NON_PRO_MAX_LINES);
      if (this.single) {
        return [filteredLines[this.currentLineIndex || 0]].filter(
          (line) => line
        );
      } else {
        return filteredLines.filter((line) => line);
      }
    },
  },
  async created() {
    this.lines.map((line) => {
      line.starttime = Number(line.starttime);
      if (line.duration) Number(line.duration);
    });
    if (this.parallellines) this.matchParallelLines();
    if (this.startLineIndex) {
      let startLineIndex = Number(this.startLineIndex);
      this.currentLine = this.lines[startLineIndex];
      this.currentLineIndex = startLineIndex;
      this.nextLine = this.lines[startLineIndex + 1];
    }
    this.attachPopupEventListeners();
  },
  beforeDestroy() {
    this.$nuxt.$off("popupOpened");
    this.$nuxt.$off("popupClosed");
  },
  watch: {
    async paused() {
      // Stop smooth scrolling
      if (this.paused && this.useSmoothScroll) {
        this.cancelSmoothScroll();
      }
      if (this.showAnimation) {
        if (this.paused) this.pauseCurrentLineAnimation();
        if (!this.paused) this.playCurrentLineAnimation();
      }
    },
    async currentTime() {
      if (this.preventJumpingAtStart) {
        this.turnOffPreventJumptingAtStartAfter3Seconds();
      }
      this.executeTimeBasedMethods();
      this.previousTime = this.currentTime;
    },
    currentLineIndex() {
      let visibleMax = Math.max(
        this.visibleMax,
        this.currentLineIndex + this.visibleRange
      );
      if (visibleMax > this.visibleMax + this.visibleRange / 2) {
        this.visibleMax = visibleMax;
      }
    },
    async currentLine() {
      if (!this.single && !this.paused) this.scrollTo(this.currentLineIndex);
      if (!this.paused && this.showAnimation) {
        if (this.single) await Helper.timeout(100) // wait for the element to render first
        this.playCurrentLineAnimation(this.single ? 0.1 : 0);
      }
    },
    parallellines() {
      if (this.parallellines) this.matchParallelLines();
    },
  },
  methods: {
    onFirstPlay() {
      if (this.currentTime >= this.lines[0].starttime) {
        this.playNearestLine();
      }
    },
    beforeJump() {
      let interrupt = this.doAutoPause();
      return interrupt;
    },
    onJump() {
      if (
        typeof this.startLineIndex !== "undefined" &&
        this.preventJumpingAtStart
      )
        return;
      this.playNearestLine();
    },
    onWithinCurrentLine() {
      this.autoPausedLineIndex = undefined // reset autopause
    },
    onCurrentLineEneded() {
      this.doAutoPause();
    },
    beforeAdvanceToNextLine() {
      let interrupt = this.doAutoPause();
      return interrupt;
    },
    onAdvanceToNextLine() {
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
    },
    getParallelLine(line, index) {
      return this.$l2.code !== this.$l1.code && this.parallellines
        ? this.matchedParallelLines[
            this.single ? this.currentLineIndex : index + this.visibleMin
          ]
        : undefined;
    },
    longPauseAfterLine(index) {
      let thisLine = this.lines[index + this.visibleMin];
      let nextLine = this.lines[index + this.visibleMin + 1];
      if (!thisLine) return false;
      if (!nextLine) return true; // this is the last line
      let endTimeOfThisLine = thisLine.starttime + thisLine.duration;
      let intervalAfterThisLine = nextLine.starttime - endTimeOfThisLine;
      if (intervalAfterThisLine > 1) return true;
    },
    play() {
      this.$emit("play");
    },
    pause() {
      this.$emit("pause");
    },
    /* Stop video when popup is open, and resume when popup closes */
    attachPopupEventListeners() {
      this.$nuxt.$on("popupOpened", () => {
        if (!this.paused) {
          this.pause();
          this.pausedOnPopupOpen = true;
        }
      });
      this.$nuxt.$on("popupClosed", () => {
        if (this.pausedOnPopupOpen) {
          this.pausedOnPopupOpen = false;
          this.play();
        }
      });
    },
    cancelSmoothScroll() {
      let id = window.requestAnimationFrame(function () {});
      while (id--) {
        window.cancelAnimationFrame(id);
      }
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
    executeTimeBasedMethods() {
      // (video starts first time) "first play"
      // (current line starts)
      // "within current line"
      // "within current line"
      // "within current line"
      // ...
      // (current line ends: starttime + duration past) "current line ended"
      // (next line starts)
      // "advance to next line"
      // "within current line"
      // "within current line"
      // ...


      let currentLineStarted =
        this.currentLine && this.currentTime > this.currentLine.starttime;

      let nextLineStarted =
        this.nextLine &&
        this.currentTime >
          this.nextLine.starttime - NEXT_LINE_STARTED_TOLERANCE;

      let nextNextLine = this.lines[this.currentLineIndex + 2];

      let nextNextLineStarted =
        nextNextLine && this.currentTime > nextNextLine.starttime;

      let currentLineEnded =
        nextLineStarted ||
        (this.currentLine &&
          this.currentLine.duration &&
          this.currentTime >
            this.currentLine.starttime + this.currentLine.duration);

      let nextLineEnded =
        nextNextLineStarted ||
        (this.nextLine &&
          this.nextLine.duration &&
          this.currentTime > this.nextLine.starttime + this.nextLine.duration);

      let withinCurrentLine = currentLineStarted && !currentLineEnded;
      let withinNextLine = nextLineStarted && !nextLineEnded;
      let betweenCurrentAndNextLine = currentLineEnded && !nextLineStarted;

      if (!this.currentLine) {
        // console.log('first play')
        this.onFirstPlay();
      }
      if (withinCurrentLine) {
        // console.log('within current line')
        this.onWithinCurrentLine();
      }
      if (betweenCurrentAndNextLine) {
        // console.log('between current and next line')
        this.onCurrentLineEneded();
      }
      if (withinNextLine) {
        // console.log('within next line')
        let interrupt = this.beforeAdvanceToNextLine();
        if (!interrupt) this.onAdvanceToNextLine();
      }
      if (
        this.currentLine &&
        !withinCurrentLine &&
        !betweenCurrentAndNextLine &&
        !withinNextLine
      ) {
        // console.log('jump')
        let interrupt = this.beforeJump();
        if (!interrupt) this.onJump();
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
    doAutoPause() {
      let interrupt = false;
      if (
        this.autoPause &&
        this.autoPausedLineIndex !== this.currentLineIndex
      ) {
        this.pause();
        this.autoPausedLineIndex = this.currentLineIndex;
        interrupt = true;
      }
      return interrupt;
    },
    async doAudioModeStuff() {
      if (!this.currentLineIndex) {
        this.currentTime = this.currentTime + 0.1;
      }
      this.$emit("pause");
      this.audioCancelled = false;
      if (
        this.matchedParallelLines &&
        this.matchedParallelLines[this.currentLineIndex]
      ) {
        this.$emit("speechStart");
        let englishPromise = Helper.speak(
          this.matchedParallelLines[this.currentLineIndex],
          this.$l1,
          1.1
        );
        await englishPromise;
      }
      if (!this.audioCancelled && !window.speechSynthesis.speaking) {
        if (this.currentLine) {
          this.$emit("speechStart");
          let japanesePromise = Helper.speak(
            this.currentLine.line,
            this.$l2,
            1
          );
          await japanesePromise;
          this.$emit("speechEnd");
        }
      }
    },
    stopAudioModeStuff() {
      this.audioCancelled = true;
      if (window && window.speechSynthesis) window.speechSynthesis.cancel();
      this.$emit("speechEnd");
      this.$emit("pause");
    },
    removeLine(lineIndex) {
      this.lines.splice(lineIndex, 1);
      if (this.matchedParallelLines)
        this.matchedParallelLines.splice(lineIndex, 1);
      this.emitUpdateTranslation();
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
    /**
     * Gets the distance from the top of the screen to top of the current video line
     */
    scrollOffset(el) {
      let smallScreenYOffset = this.getSmallScreenOffset();
      let transcriptLineHeight = el.clientHeight;
      let stage;
      if (smallScreenYOffset) {
        // vertical layout
        stage = window.innerHeight + smallScreenYOffset;
      } else {
        // horizontal layout
        stage =
          Math.min(
            window.innerHeight / 2,
            (this.$el.clientWidth * 9) / 16 + 52
          ) * 2;
      }
      let offset = -stage / 2 + transcriptLineHeight / 2;
      return offset;
    },
    smoothScrollToCurrentLine(offset) {
      let lastDuration =
        this.previousLine && this.currentLine
          ? (this.currentLine.starttime - this.previousLine.starttime) * 1000
          : 3000;
      lastDuration = lastDuration || 3000;
      let duration =
        this.currentLine && this.nextLine
          ? Math.min(
              (this.nextLine.starttime - this.currentLine.starttime) * 1000,
              lastDuration,
              3000
            )
          : 3000;
      this.$smoothScroll({
        scrollTo: el,
        updateHistory: false,
        offset,
        duration,
        left: 0,
        easingFunction: (t) => t,
      });
    },
    scrollTo(lineIndex) {
      let el = this.$el.querySelector(
        `.transcript-line[data-line-index="${lineIndex}"]`
      );
      if (el) {
        let elementTop = Helper.documentOffsetTop(el); // distance from top of the document to the top of the element
        let offset = this.scrollOffset(el);
        let top = elementTop + offset;
        let scrollDistanceIsLarge = Math.abs(window.scrollY - top) > 1000;
        if (this.useSmoothScroll && !scrollDistanceIsLarge) {
          this.smoothScrollToCurrentLine(offset);
        } else {
          window.scrollTo({
            top,
            left: 0,
            behavior: scrollDistanceIsLarge ? "auto" : "smooth",
          });
        }
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
      this.seekVideoTo(line.starttime - NEXT_LINE_STARTED_TOLERANCE + 0.05); // We rewind to a little bit earlier to capture more audio at the beginning of the line
      if (!this.paused) {
        this.playCurrentLineAnimation();
      }
    },
    playCurrentLineAnimation() {
      if (!this.showAnimation) return;
      let currentLineRefs = this.single
        ? this.$refs[`transcript-line`]
        : this.$refs[`transcript-line-${this.currentLineIndex}`];
      if (currentLineRefs && currentLineRefs[0]) {
        currentLineRefs[0].playAnimation(
          this.single
            ? 0
            : Math.min(this.currentTime - this.currentLine.starttime, 0)
        );
      }
    },
    pauseCurrentLineAnimation() {
      let currentLineRefs =
        this.$refs[`transcript-line-${this.currentLineIndex}`];
      if (currentLineRefs && currentLineRefs[0])
        currentLineRefs[0].pauseAnimation();
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
.transcript-wrapper {
  position: relative;
}
</style>