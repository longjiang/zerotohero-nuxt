<template>
  <div
    :class="{
      'synced-transcript': true,
      'synced-transcript-multi-line': !single,
      'synced-transcript-single-line': single,
      [`skin-${$skin}`]: true,
    }"
  >
    <client-only>
      <ReviewItemCollector
        v-if="showQuiz"
        ref="reviewItemCollector"
        @showQuiz="pause"
        @goToLine="goToLine($event)"
        :active="paused"
      />
      <div class="transcript-wrapper">
        <client-only>
          <Loader class="text-center w-100" />
          <template
            v-for="(line, index) in filteredLines.slice(this.visibleMin, this.visibleMax)"
          >
            <TranscriptLine
              v-bind="{
                line,
                video,
                showSubsEditing,
                showAnimation,
                speed,
                sticky,
                single,
                hsk,
                notes,
                textSize: single ? textSize : 1,
                parallelLine: matchedParallelLine(index),
                showParallelLine:
                  $l1.code !== $l2.code &&
                  parallellines &&
                  parallellines.length > 0,
                lineIndex: index + visibleMin,
                current: currentLine === line,
                currentTime,
                paused,
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
              :ref="
                single
                  ? 'transcript-line'
                  : `transcript-line-${index + visibleMin}`
              "
              @click="lineClick(line)"
              @removeLineClick="removeLine(index + visibleMin)"
              @trasnlationLineBlur="trasnlationLineBlur"
              @trasnlationLineKeydown="trasnlationLineKeydown"
              @savedWordsFound="
                addLineToReview(
                  $event,
                  line,
                  index + visibleMin,
                  matchedParallelLine(index)
                )
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
              v-if="showYouNeedPro"
              :showLogo="!single"
              :class="{
                'transcript-you-need-pro rounded': true,
                'pb-3 px-3': true,
              }"
            />
          </template>
        </client-only>
      </div>
    </client-only>
  </div>
</template>

<script>
import {
  uniqueId,
  timeout,
  SpeechSingleton,
  documentOffsetTop,
  NON_PRO_MAX_LINES,
} from "../lib/utils";

const NEXT_LINE_STARTED_TOLERANCE = 0.15; // seconds
const VISIBLE_RANGE = 15; // lines

export default {
  props: {
    skin: {
      default: null,
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
    starttime: {
      default: 0,
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
    speed: {
      default: 1,
    },
    collapsed: {
      default: false,
    },
    currentTime: {
      type: Number,
    },
    landscape: {
      default: false,
    },
    textSize: {
      default: 1,
    },
    forcePro: {
      default: false,
    },
    autoPause: {
      default: false,
    },
    useSmoothScroll: {
      default: false,
    },
    video: {
      type: Object,
    },
    showQuiz: {
      default: false,
    },
  },
  data() {
    return {
      sW: [],
      id: uniqueId(),
      previousTime: 0,
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
      visibleMax: this.startLineIndex ? Number(this.startLineIndex) + VISIBLE_RANGE : VISIBLE_RANGE,
      autoPausedLineIndex: undefined,
      NON_PRO_MAX_LINES,
      preventCurrentTimeUpdate: false,
    };
  },
  computed: {
    startLineIndex() {
      if (this.starttime) {
        return this.nearestLineIndex(this.starttime);
      }
    },
    currentLineVisible() {
      if (this.single) return true;
      const transcriptLineRef = `transcript-line-${
        this.currentLineIndex + this.visibleMin
      }`;
      const transcriptLine = this.$refs[transcriptLineRef]?.[0]?.$el;

      if (transcriptLine) {
        const scrollingContainer = transcriptLine.closest(".content-area");
        if (scrollingContainer) {
          const containerRect = scrollingContainer.getBoundingClientRect();
          const elementRect = transcriptLine.getBoundingClientRect();
          return (
            elementRect.top >= containerRect.top &&
            elementRect.bottom <= containerRect.bottom &&
            elementRect.left >= containerRect.left &&
            elementRect.right <= containerRect.right
          );
        }
      }
      return false;
    },
    showYouNeedPro() {
      let showYouNeedPro = false;
      if (this.single) {
        showYouNeedPro = this.currentLineIndex > NON_PRO_MAX_LINES;
      } else {
        showYouNeedPro = this.filteredLines.length < this.lines.length;
      }
      return showYouNeedPro;
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
        return [filteredLines[this.currentLineIndex || 0]].filter((line) => line);
      } else {
        return filteredLines.filter((line) => line);
      }
    },
    pro() {
      return this.forcePro || this.$store.state.subscriptions.active;
    },
  },
  async created() {
    this.lines.map((line) => {
      line.starttime = Number(line.starttime);
      if (line.duration) Number(line.duration);
    });
    if (this.parallellines?.length) this.matchParallelLines();

    if (this.startLineIndex) {
      let startLineIndex = Number(this.startLineIndex);
      this.currentLine = this.lines[startLineIndex];
      this.currentLineIndex = startLineIndex;
      this.nextLine = this.lines[startLineIndex + 1];
    }
  },
  mounted() {
    this.attachPopupEventListeners();
  },
  beforeDestroy() {
    this.$nuxt.$off("popupOpened");
    this.$nuxt.$off("popupClosed");
  },
  watch: {
    async paused() {
      // スムーズスクロールを途中で止めたい場合
      if (this.paused && this.useSmoothScroll) {
        this.cancelSmoothScroll();
      }
    },
    async currentTime() {
      if (this.preventCurrentTimeUpdate) return;
      this.executeTimeBasedMethods();
      this.previousTime = this.currentTime;
    },
    currentLineIndex(newValue, oldValue) {
      // すでに画面内にあるならスクロールなし
      if (this.isLineVisible(newValue)) {
        return;
      }
      // 可視範囲を少しずつ拡張する
      const NEXT_VISIBLE_RANGE = 5;
      if (newValue + NEXT_VISIBLE_RANGE > this.visibleMax) {
        this.visibleMax = newValue + NEXT_VISIBLE_RANGE;
      }
      if (newValue < this.visibleMin) {
        this.visibleMin = Math.max(0, newValue - NEXT_VISIBLE_RANGE);
      }

      // スクロール先を探す
      const el = this.$el.querySelector(
        `.transcript-line[data-line-index="${newValue}"]`
      );
      if (!el) return;

      // スクロール位置を計算
      const elementTop = this.documentOffsetTop(el);
      const offset = this.scrollOffset(el);
      const top = elementTop + offset;
      const contentArea = document.querySelector(".content-area");
      if (!contentArea) return;

      const currentScrollY = contentArea.scrollTop;
      const distance = Math.abs(currentScrollY - top);
      const scrollDistanceIsLarge = distance > 1000;

      // 独自のスムーススクロール vs. ネイティブスクロール
      if (this.useSmoothScroll && !scrollDistanceIsLarge) {
        this.smoothScrollToCurrentLine(offset, el);
      } else {
        this.$nuxt.$emit("scroll-to", {
          top,
          left: 0,
          behavior: scrollDistanceIsLarge ? "auto" : "smooth",
        });
      }
    },
    parallellines() {
      if (this.parallellines?.length) this.matchParallelLines();
    },
  },
  methods: {
    isLineVisible(lineIndex) {
      const lineRef = this.$refs[`transcript-line-${lineIndex}`];
      if (!lineRef || !lineRef[0]) return false;
      const el = lineRef[0].$el;
      const bounding = el.getBoundingClientRect();
      const container = el.closest(".content-area");
      if (!container) return false;
      const containerRect = container.getBoundingClientRect();
      return (
        bounding.top >= containerRect.top &&
        bounding.bottom <= containerRect.bottom
      );
    },
    scrollOffset(el) {
      const transcriptLineHeight = el.clientHeight;
      const halfViewport = window.innerHeight / 2;
      return -halfViewport + transcriptLineHeight / 2;
    },
    documentOffsetTop(el) {
      let top = 0;
      while (el) {
        top += el.offsetTop;
        el = el.offsetParent;
      }
      return top;
    },
    smoothScrollToCurrentLine(offset, el) {
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

      this.$nuxt.$emit("smooth-scroll-to", {
        el,
        offset,
        left: 0,
        duration,
      });
    },
    matchedParallelLine(index) {
      return this.matchedParallelLines
        ? this.matchedParallelLines[
            this.single
              ? this.currentLineIndex || 0
              : index + this.visibleMin
          ]
        : null;
    },
    addLineToReview(savedWords, line, lineIndex, parallelLine) {
      if (this.showQuiz) {
        this.$refs.reviewItemCollector?.addLineToReview({
          savedWords,
          line,
          lineIndex,
          parallelLine,
          video: this.video,
        });
      }
    },
    async tokenizeNextLines() {
      let dictionary = await this.$getDictionary();
      if (this.lines) {
        let nextLines = this.lines.slice(
          this.currentLineIndex,
          this.currentLineIndex + 5
        );
        for (let line of nextLines) {
          await dictionary.tokenizeWithCache(line.line);
        }
      }
    },
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
      this.playNearestLine();
    },
    onWithinCurrentLine() {
      this.autoPausedLineIndex = undefined;
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
    longPauseAfterLine(index) {
      let thisLine = this.lines[index + this.visibleMin];
      let nextLine = this.lines[index + this.visibleMin + 1];
      if (!thisLine) return false;
      if (!nextLine) return true;
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
    visibilityChanged(isVisible) {
      if (isVisible) {
        this.visibleMax = this.visibleMax + VISIBLE_RANGE;
      }
    },
    trasnlationLineBlur(e) {
      this.trasnlationLineChanged(e);
    },
    async trasnlationLineKeydown(e) {
      if (e.key === "Enter") {
        await timeout(100);
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
    matchParallelLines() {
      if (!this.parallellines) {
        this.matchedParallelLines = [];
        return;
      }
      this.matchedParallelLines = this.matchLines(
        this.lines,
        this.parallellines
      );
    },
    matchLines(lines, parallelLines, tolerance = 1.0) {
      let matchedLines = [];
      let i = 0;
      for (let line of lines) {
        let matchedLine = "";
        let hasMatched = false;
        while (i < parallelLines.length) {
          let difference = line.starttime - parallelLines[i].starttime;
          if (Math.abs(difference) <= tolerance) {
            matchedLine += " " + parallelLines[i].line;
            hasMatched = true;
          }
          if (difference < 0) {
            break;
          } else {
            i++;
          }
        }
        if (!hasMatched) {
          matchedLine = matchedLines[matchedLines.length - 1] || "";
        }
        matchedLines.push(matchedLine.trim());
      }
      return matchedLines;
    },
    executeTimeBasedMethods() {
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
          this.currentTime >
            this.nextLine.starttime + this.nextLine.duration);
      let withinCurrentLine = currentLineStarted && !currentLineEnded;
      let withinNextLine = nextLineStarted && !nextLineEnded;
      let betweenCurrentAndNextLine = currentLineEnded && !nextLineStarted;

      if (!this.currentLine) {
        this.onFirstPlay();
      }
      if (withinCurrentLine) {
        this.onWithinCurrentLine();
      }
      if (betweenCurrentAndNextLine) {
        this.onCurrentLineEneded();
      }
      if (withinNextLine) {
        let interrupt = this.beforeAdvanceToNextLine();
        if (!interrupt) this.onAdvanceToNextLine();
      }
      if (
        this.currentLine &&
        !withinCurrentLine &&
        !betweenCurrentAndNextLine &&
        !withinNextLine
      ) {
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
      if (this.autoPause && this.autoPausedLineIndex !== this.currentLineIndex) {
        this.pause();
        this.autoPausedLineIndex = this.currentLineIndex;
        interrupt = true;
      }
      return interrupt;
    },
    async doAudioModeStuff() {
      this.$emit("pause");
      this.audioCancelled = false;
      if (
        this.matchedParallelLines &&
        this.matchedParallelLines[this.currentLineIndex]
      ) {
        this.$emit("speechStart");
        let englishPromise = SpeechSingleton.instance.speak(
          this.matchedParallelLines[this.currentLineIndex],
          this.$l1,
          1.1
        );
        await englishPromise;
      }
      if (!this.audioCancelled && !SpeechSingleton.instance.speaking) {
        if (this.currentLine) {
          this.$emit("speechStart");
          let japanesePromise = SpeechSingleton.instance.speak(
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
      if (window && SpeechSingleton.instance) SpeechSingleton.instance.stop();
      this.$emit("speechEnd");
      this.$emit("pause");
    },
    removeLine(lineIndex) {
      let linesCopy = [...this.lines];
      linesCopy.splice(lineIndex, 1);
      this.$store.commit("shows/MODIFY_ITEM", {
        item: this.video,
        key: "subs_l2",
        value: linesCopy,
      });
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
        let transcriptContainerWidth = this.$el.clientWidth;
        let videoHeight = this.collapsed
          ? 0
          : (transcriptContainerWidth * 9) / 16;
        smallScreenOffset = videoHeight + controllerHeight;
      } else {
        smallScreenOffset = 0;
      }
      return smallScreenOffset;
    },
    scrollOffset(el) {
      let smallScreenYOffset = this.getSmallScreenOffset();
      let transcriptLineHeight = el.clientHeight;
      let stage;
      if (smallScreenYOffset) {
        stage = window.innerHeight + smallScreenYOffset;
      } else {
        stage =
          Math.min(
            window.innerHeight / 2,
            (this.$el.clientWidth * 9) / 16 + 52
          ) * 2;
      }
      let offset = -stage / 2 + transcriptLineHeight / 2;
      return offset;
    },
    scrollTo(lineIndex) {
      let el = this.$el.querySelector(
        `.transcript-line[data-line-index="${lineIndex}"]`
      );
      if (el) {
        let elementTop = documentOffsetTop(el);
        let offset = this.scrollOffset(el);
        let top = elementTop + offset;
        const contentArea = document.querySelector(".content-area");
        const currentScrollY = contentArea.scrollTop;
        let scrollDistanceIsLarge = Math.abs(currentScrollY - top) > 1000;
        if (this.useSmoothScroll && !scrollDistanceIsLarge) {
          this.smoothScrollToCurrentLine(offset, el);
        } else {
          this.$nuxt.$emit("scroll-to", {
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
          this.$store.commit("shows/MODIFY_ITEM", {
            item: line,
            key: "starttime",
            value: this.currentTime,
          });
        } else if (lineIndex > currentLineIndex) {
          this.$store.commit("shows/MODIFY_ITEM", {
            item: line,
            key: "starttime",
            value: line.starttime + delta,
          });
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
      this.seekVideoTo(line.starttime);
    },
    rewind() {
      this.goToLine(this.currentLine);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../assets/scss/variables.scss";

.synced-transcript {
  .transcript-title {
    font-weight: bold;
    font-size: 1.5rem;
  }

  &.synced-transcript-multi-line {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  &.skin-dark {
    .transcript-line {
      color: $bg-color-light-2;
    }
  }

  &.skin-light {
    .transcript-line {
      color: $bg-color-dark-4;
    }
  }
}

.transcript-wrapper {
  position: relative;
}

.synced-transcript-multi-line .transcript-you-need-pro {
  position: absolute;
  bottom: 0;
  width: 100%;
}

.zerotohero-not-wide.zerotohero-with-nav {
  .transcript-you-need-pro {
    bottom: 4.5rem; // バottomメニューぶんマージン
  }
}

.video-transcript-wrapper.overlay {
  .transcript-you-need-pro {
    position: inherit;
    width: 100%;
  }
}
</style>