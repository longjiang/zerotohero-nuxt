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
          <template v-for="(line, index) in filteredLines.slice(this.visibleMin, this.visibleMax - this.visibleMin)">
            <TranscriptLine
              :line="line"
              :parallelLine="
                $l2.code !== $l1.code && parallellines
                  ? matchedParallelLines[
                      single ? currentLineIndex : index + visibleMin
                    ]
                  : undefined
              "
              :showParallelLine="parallellines && parallellines.length > 0"
              :lineIndex="index + visibleMin"
              :key="`line-${index + visibleMin}-${
                line.starttime
              }-${line.line.substr(0, 10)}`"
              :abnormal="
                $adminMode &&
                lines[index + visibleMin - 1] &&
                lines[index + visibleMin - 1].starttime > line.starttime
              "
              :current="currentLine === line"
              :matched="
                !single &&
                highlight &&
                line &&
                new RegExp(highlight.join('|')).test(line.line)
              "
              :ref="`${single ? 'transcript-line' : 'transcript-line-'}${
                !single ? index + visibleMin : ''
              }`"
              :duration="
                line.duration
                  ? line.duration
                  : lines[single ? currentLineIndex + 1 : index + 1]
                  ? lines[single ? currentLineIndex + 1 : index + 1].starttime -
                    line.starttime
                  : 5
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
              v-if="(!single && filteredLines.length < lines.length) || (single && currentLineIndex > NON_PRO_MAX_LINES - 7)"
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

const NON_PRO_MAX_LINES = 19; // The 'you need pro' prompt obscures 7 lines, so only NON_PRO_MAX_LINES - 7 are actually visible to non-pro users

const POPULAR_LANGS = 'zh ja en fr de es ko ru yue it'.split(' ')

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
    enableTranslationEditing: {
      default: false,
    },
    collapsed: {
      default: false,
    },
    landscape: {
      default: false,
    },
    forcePro: {
      default: false
    }
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
      preventJumpingAtStart: typeof this.startLineIndex !== "undefined",
      NON_PRO_MAX_LINES
    };
  },
  computed: {
    pro() {
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
      if (!this.pro && !this.forcePro) filteredLines = filteredLines.slice(0, NON_PRO_MAX_LINES);
      if (this.single) {
        return [filteredLines[this.currentLineIndex || 0]].filter(
          (line) => line
        );
      } else {
        return filteredLines.filter((line) => line)
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
      if (this.paused) {
        this.cancelSmoothScroll();
      }
      if (this.paused) this.pauseCurrentLineAnimation();
      if (!this.paused) this.playCurrentLineAnimation();
    },
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
    currentLineIndex() {
      let visibleMax = Math.max(
        this.visibleMax,
        this.currentLineIndex + this.visibleRange
      );
      if (visibleMax > this.visibleMax + this.visibleRange / 2) {
        this.visibleMax = visibleMax;
      }
    },
    currentLine() {
      if (!this.single && !this.paused) this.scrollTo(this.currentLineIndex);
      if (!this.paused) {
        this.playCurrentLineAnimation();
      }
    },
    parallellines() {
      if (this.parallellines) this.matchParallelLines();
    },
  },
  methods: {
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
            : 3000;

        lastDuration = lastDuration || 3000;

        let offset =
          -(smallScreenYOffset
            ? window.innerHeight + smallScreenYOffset
            : Math.min(
                window.innerHeight / 2,
                (this.$el.clientWidth * 9) / 16 + 52
              ) *
                2 -
              elHeight / 2) /
            2 +
          elHeight / 2;

        let offsetTop = Helper.documentOffsetTop(el);
        let top = offsetTop + offset;
        if (Math.abs(window.scrollY - top) > 1000) {
          window.scrollTo({
            top,
            left: 0,
          });
        } else {
          window.scrollTo({
            top,
            left: 0,
            behavior: "smooth",
          });
          // if (navigator.hardwareConcurrency >= 4) {
          //   let duration =
          //     this.currentLine && this.nextLine
          //       ? Math.min(
          //           (this.nextLine.starttime - this.currentLine.starttime) *
          //             1000,
          //           lastDuration,
          //           3000
          //         )
          //       : 3000;
          //   this.$smoothScroll({
          //     scrollTo: el,
          //     updateHistory: false,
          //     offset,
          //     duration,
          //     left: 0,
          //     easingFunction: (t) => t,
          //   });
          // }
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
      this.seekVideoTo(line.starttime - 0.2); // We rewind to 200ms earlier to capture more audio at the beginning of the line
      if (!this.paused) {
        this.playCurrentLineAnimation();
      }
    },
    playCurrentLineAnimation() {
      let currentLineRefs = this.single
        ? this.$refs[`transcript-line`]
        : this.$refs[`transcript-line-${this.currentLineIndex}`];
      if (currentLineRefs && currentLineRefs[0])
        currentLineRefs[0].playAnimation(
          this.single
            ? 0
            : Math.min(this.currentTime - this.currentLine.starttime, 0)
        );
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