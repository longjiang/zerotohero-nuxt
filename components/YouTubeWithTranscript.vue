<template>
  <div
    :class="`youtube-with-transcript youtube-with-transcript-${layout} ${
      layout === 'horizontal'
        ? 'youtube-with-transcript-horizontal-' +
          (landscape ? 'landscape' : 'portrait')
        : ''
    } ${useAutoTextSize ? 'youtube-with-transcript-auto-size' : ''}`"
  >
    <div
      :class="{
        'youtube-video-column col-sm-12 p-0': true,
        'order-2': landscape && $l2.direction === 'rtl',
      }"
    >
      <div class="youtube-video-wrapper" :key="'youtube-' + video.youtube_id">
        <LazyYouTubeVideo
          ref="youtube"
          :class="{ 'd-none': collapsed }"
          v-bind="{
            speed,
            cc,
            autoload,
            autoplay,
            startAtRandomTime,
            youtube: video.youtube_id,
            controls: false,
            starttime: startTimeOrLineIndex,
          }"
          @paused="updatePaused"
          @currentTime="updateCurrentTime"
          @ended="updateEnded"
          @duration="updateDuration"
          @videoUnavailable="onVideoUnavailable"
        />
        <LazyVideoControls
          v-if="showControls && video"
          ref="videoControls"
          v-bind="{
            video,
            paused,
            layout,
            show,
            showType,
            largeEpisodeCount,
            showInfoButton: layout === 'vertical' && showInfo,
            episodes,
            showLineList,
            showFullscreenToggle,
            showCollapse: layout === 'horizontal',
            duration,
            initialTime: starttime ? starttime : 0,
          }"
          @previous="$emit('previous')"
          @next="$emit('next')"
          @goToLine="goToLine"
          @play="play"
          @pause="pause"
          @rewind="rewind"
          @updateCollapsed="(c) => (this.collapsed = c)"
          @updateAudioMode="(a) => (this.audioMode = a)"
          @updateSpeed="(s) => (speed = s)"
          @toggleFullscreenMode="toggleFullscreenMode"
          @updateSmoothScroll="(r) => (this.useSmoothScroll = r)"
          @updateAutoPause="(r) => (this.autoPause = r)"
          @updateRepeatMode="(r) => (this.repeatMode = r)"
          @updateQuizMode="(r) => (this.quizeMode = r)"
          @goToPreviousLine="$refs.transcript.goToPreviousLine()"
          @goToNextLine="$refs.transcript.goToNextLine()"
          @seek="onSeek"
        />
        <div
          v-if="
            landscape && related && related.length > 0
          "
          class="pl-3 pt-4"
        >
          <VideoAdmin
            v-if="$adminMode"
            :showVideoDetails="false"
            :showTextEditing="false"
            :video="video"
            ref="videoAdmin3"
            @showSubsEditing="toggleShowSubsEditing"
            @updateTranslation="updateTranslation"
            @updateOriginalText="updateOriginalText"
            @enableTranslationEditing="toggleEnableTranslationEditing"
            @updateTranscript="updateTranscript"
          />
          <YouTubeVideoList
            :videos="related.slice(0, 6)"
            :showDate="true"
            :showProgress="true"
            skin="dark"
          />
        </div>
      </div>
    </div>
    <div class="youtube-transcript-column">
      <div
        class="youtube-video-info youtube-video-info-top"
        v-if="layout === 'horizontal'"
      >
        <h3
          v-if="video.title"
          :class="{
            h4: video.title.length > 30,
            h5: video.title.length > 60,
          }"
          style="line-height: 1.5"
        >
          <span v-if="video" :key="`video-title-${video.title}`">
            <Annotate
              :phonetics="false"
              :buttons="true"
              v-if="$l2.code !== 'tlh' && $l2.direction !== 'rtl'"
              :showLoading="false"
            >
              <span>{{ video.title }}</span>
            </Annotate>
            <span v-else>{{ video.title }}</span>
          </span>
        </h3>
        <VideoAdmin
          :video="video"
          ref="videoAdmin1"
          @showSubsEditing="toggleShowSubsEditing"
          @updateTranslation="updateTranslation"
          @updateOriginalText="updateOriginalText"
          @enableTranslationEditing="toggleEnableTranslationEditing"
          @updateTranscript="updateTranscript"
        />
        <EpisodeNav
          :video="video"
          :episodes="episodes"
          :showType="showType"
          :skin="skin"
          :show="show"
          :largeEpisodeCount="largeEpisodeCount"
          class="mt-3"
        />
      </div>
      <!-- this is necessary for updating the transcript upon srt drop -->
      <div class="d-none">{{ transcriptKey }}</div>
      <SyncedTranscript
        v-if="video.subs_l2 && video.subs_l2.length > 0"
        ref="transcript"
        :class="{ 'd-none': layout === 'mini' }"
        :key="'transcript-' + video.youtube_id + '-' + transcriptKey"
        v-bind="{
          lines: video.subs_l2 || [],
          parallellines: video.subs_l1 || [],
          starttime: startTimeOrLineIndex,
          single: ['vertical', 'mini'].includes(layout),
          showAnimation,
          showSubsEditing,
          enableTranslationEditing,
          sticky,
          speed,
          notes: video.notes,
          collapsed,
          startLineIndex,
          skin,
          textSize,
          landscape,
          stopLineIndex,
          forcePro,
          autoPause,
          useSmoothScroll,
          video,
          quizeMode
        }"
        @seek="seekYouTube"
        @pause="pause"
        @play="play"
        @speechStart="speechStart"
        @speechEnd="speechEnd"
        @updateTranslation="updateTranslation"
      />
      <div
        class="youtube-video-info youtube-video-info-bottom"
        v-if="layout === 'horizontal'"
      >
        <div class="text-center mt-5 mb-5" v-if="video.checkingSubs">
          <Loader :sticky="true" message="Loading subtitles..." />
        </div>
        <div
          class="mt-4 mb-5 rounded"
          style="color: rgba(136, 136, 136, 0.85)"
          v-if="
            (!video.subs_l2 || video.subs_l2.length === 0) &&
            !video.checkingSubs
          "
        >
          <h6>
            This YouTube video does not have closed captions (CC) in
            {{ $l2.name }}.
          </h6>
          <div class="mt-3">
            If you have the subtitles file (.srt or .ass), you can add it by
            dragging &amp; dropping it above.
          </div>
        </div>
        <client-only>
          <EpisodeNav
            :video="video"
            v-if="pro"
            :skin="skin"
            :episodes="episodes"
            :show="show"
            :showType="showType"
            :largeEpisodeCount="largeEpisodeCount"
            class="mt-4 mb-4 ml-4"
          />
          <VideoAdmin
            v-if="$adminMode"
            ref="videoAdmin2"
            :class="{ 'mt-5': true }"
            :video="video"
            @showSubsEditing="toggleShowSubsEditing"
            @updateTranslation="updateTranslation"
            @updateOriginalText="updateOriginalText"
            @updateTranscript="updateTranscript"
            @enableTranslationEditing="toggleEnableTranslationEditing"
          />
        </client-only>
        <div
          v-if="related && related.length > 0"
          class="pr-2 pb-5 mb-5"
          style="padding-left: 2rem !important"
        >
          <YouTubeVideoList
            :videos="related.slice(0, 24)"
            :showDate="true"
            :showProgress="true"
            skin="dark"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import YouTube from "@/lib/youtube";
import { timeout } from "@/lib/utils";
import { shuffle, safeShuffle, uniqueByValue } from "@/lib/utils/array";

export default {
  props: {
    video: {
      type: Object,
    },
    sticky: {
      default: false,
    },
    show: {
      type: Object,
    },
    showType: {
      type: String,
    },
    showInfo: {
      type: Boolean,
      default: true,
    },
    showInfoButton: {
      // Whether to show an "i" button that toggles the video information display modal
      type: Boolean,
      default: false,
    },
    cc: {
      type: Boolean, // Whether to show cc inside the iframe player
      default: false,
    },
    episodes: {
      type: Array,
    },
    largeEpisodeCount: {
      type: Number, // Mannually set the number of episode displayed in the episode navigator
    },
    initialLayout: {
      type: String,
      default: "horizontal", // or 'vertical', 'mini'
    },
    highlight: {
      type: Array,
    },
    hsk: {
      default: "outside",
    },
    autoload: {
      default: false,
    },
    autoplay: {
      default: false,
    },
    startLineIndex: {
      default: undefined,
    },
    starttime: {
      default: 0,
    },
    startAtRandomTime: {
      default: 0,
    },
    stopLineIndex: {
      default: -1,
    },
    skin: {
      default: "light",
    },
    forcePortrait: {
      default: false,
    },
    showFullscreenToggle: {
      default: true,
    },
    showLineList: {
      default: true,
    },
    showControls: {
      default: true,
    },
    forcePro: {
      default: false,
    },
    showAnimation: {
      default: true,
    },
    useAutoTextSize: {
      default: false,
    },
  },
  data() {
    return {
      audioMode: false,
      autoPause: false,
      useSmoothScroll: false,
      collapsed: false,
      currentTime: 0,
      duration: undefined,
      enableTranslationEditing: false,
      layout: this.initialLayout,
      neverPlayed: true,
      paused: true,
      repeatMode: false,
      showSubsEditing: false,
      speaking: false,
      speed: 1,
      textSize: 1,
      transcriptKey: 0,
      videoInfoKey: 0,
      viewportHeight: undefined,
      viewportWidth: undefined,
      quizeMode: false
    };
  },
  computed: {
    pro() {
      // if ([this.$l2.code, this.$l1.code].includes("zh")) return true;
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
    startTimeOrLineIndex() {
      let starttime = 0;
      if (this.starttime) starttime = this.starttime;
      else if (this.startLineIndex) {
        if (
          this.video.subs_l2 &&
          this.video.subs_l2.length > 0 &&
          this.video.subs_l2[this.startLineIndex]
        ) {
          starttime = this.video.subs_l2[this.startLineIndex].starttime;
        }
      }
      return starttime;
    },
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
    landscape() {
      if (this.layout === "horizontal" && !this.collapsed) {
        if (this.forcePortrait) return false;
        if (process.browser && this.viewportWidth && this.viewportHeight) {
          let landscape = this.viewportWidth > this.viewportHeight;
          return landscape;
        }
      }
    },
    episodeIndex() {
      return this.episodes.findIndex(
        (v) => v.youtube_id === this.video.youtube_id
      );
    },
    related() {
      let related = []
      if (this.episodes && this.episodes.length > 0 && this.episodeIndex >= 0) {
        let watchedYouTubeIds = this.$store.state.history.history.map(h => h.video?.youtube_id)
        let popularEpisodes = this.episodes.slice().filter(e => !watchedYouTubeIds.includes(e.youtube_id)).sort((a, b) => b.views - a.views)
        related = [
          ...shuffle([
            ...this.episodes.slice(this.episodeIndex + 2, this.episodeIndex + 16),
            ...shuffle(popularEpisodes.slice(0, 16)),
          ]),
        ];
        let nextEpisode = this.episodes[this.episodeIndex + 1];
        if (nextEpisode) related = [nextEpisode, ...related]
      }
      return uniqueByValue(related, 'youtube_id');
    },
  },
  created() {
    if (process.browser) {
      window.addEventListener("resize", this.updateLayout);
    }
  },
  destroyed() {
    window.removeEventListener("resize", this.updateLayout);
  },
  async mounted() {
    this.getL1Transcript();
    this.updateLayout();
    if (typeof this.$store.state.settings !== "undefined") {
      this.useSmoothScroll = this.$store.state.settings.useSmoothScroll;
    }
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type === "settings/LOAD_SETTINGS") {
        this.useSmoothScroll = this.$store.state.settings.useSmoothScroll;
      }
    });
  },
  async updated() {
    if (this.$refs.transcript) {
      this.$refs.transcript.repeatMode = this.repeatMode;
      this.$refs.transcript.audioMode = this.audioMode;
    }
    if (this.$refs.youtube) this.$refs.youtube.speed = this.speed;
  },
  watch: {
    async "video.youtube_id"() {
      await this.getL1Transcript();
    },
    repeatMode() {
      if (this.$refs.transcript)
        this.$refs.transcript.repeatMode = this.repeatMode;
    },
    audioMode() {
      if (this.$refs.transcript)
        this.$refs.transcript.audioMode = this.audioMode;
    },
    startLineIndex() {
      if (
        this.$refs.youtube &&
        this.$refs.youtube.player &&
        this.$refs.youtube.player.seekTo
      ) {
        this.rewind();
      }
    },
    initialLayout() {
      this.layout = this.initialLayout;
    },
  },
  methods: {
    getTextSize() {
      let el = this.$el.querySelector(".synced-transcript");
      if (el) {
        let styles = getComputedStyle(el);
        let height = Number(styles.height.replace("px", ""));
        let width = Number(styles.width.replace("px", ""));
        let area = height * width;
        let averageL2LineLength =
          this.video.subs_l2
            .map((l) => (l.line ? l.line.length : 0))
            .reduce((p, c) => p + c) / this.video.subs_l2.length;
        let averageL1LineLength = this.video.subs_l1
          ? this.video.subs_l1
              .map((l) => (l.line ? l.line.length : 0))
              .reduce((p, c) => p + c) / this.video.subs_l1.length
          : 0;
        let length = averageL1LineLength + averageL2LineLength;
        let vertical = this.viewportWidth < this.viewportHeight;
        const SCALE_FACTOR = vertical ? 1200 : 2000; // Make text bigger on phones
        let textSize = area / length / SCALE_FACTOR;
        textSize = Math.min(textSize, 2.2);
        textSize = Math.max(textSize, 1.2);

        this.textSize = textSize;
      }
    },
    onSeek(percentage) {
      let time = this.duration * percentage;
      this.seekYouTube(time);
    },
    updateTranscript() {
      this.transcriptKey++;
    },
    onVideoUnavailable(youtube_id) {
      if (youtube_id === this.video.youtube_id) {
        this.$emit("videoUnavailable", youtube_id);
      }
    },
    updateLayout() {
      this.viewportWidth = this.$el.clientWidth;
      this.viewportHeight = window.innerHeight;
      // if (this.useAutoTextSize) this.getTextSize(); // Too buggy for production
    },
    async getL1Transcript() {
      if (this.$l2.code === this.$l1.code) return;
      let video = Object.assign({}, this.video);
      if (!video) return;
      let missingSubsL1 = !this.video.subs_l1 || this.video.subs_l1.length === 0;
      if (missingSubsL1) {
        console.log(
          `YouTube with Transcript: Getting available L1 transcripts...`
        );
        video = await YouTube.getYouTubeSubsListAndAddLocale(
          video,
          this.$l1,
          this.$l2,
          this.$adminMode ? 0 : -1 // cacheLife
        );
        console.log(
          `YouTube with Transcript: Getting ${this.$l1.name} transcript`
        );
        let subs_l1;
        if (video.l1Locale && video.l1Locale !== video.l2Locale) {
          subs_l1 = await YouTube.getTranscript(
            video.youtube_id,
            video.l1Locale,
            undefined
          );
          if (!subs_l1 || !subs_l1[0]) {
            subs_l1 = await YouTube.getTranscript(
              video.youtube_id,
              video.l1Locale,
              undefined,
              true // force refresh if no subs found
            );
          }
        } else {
          subs_l1 = await YouTube.getTranslatedTranscript(
            video.youtube_id,
            video.l2Locale,
            video.l2Name,
            this.$l1.code === "zh" ? "zh-Hans" : this.$l1.code // tlang
          );
          if (!subs_l1 || !subs_l1[0]) {
            subs_l1 = await YouTube.getTranslatedTranscript(
              video.youtube_id,
              video.l2Locale,
              video.l2Name,
              this.$l1.code === "zh" ? "zh-Hans" : this.$l1.code, // tlang
              true // forceRefresh
            );
          }
          if (!subs_l1 || !subs_l1[0]) {
            let useGenerated = !this.video.subs_l2 || this.video.subs_l2.length === 0
            subs_l1 = await YouTube.getTranslatedTranscript(
              video.youtube_id,
              video.l2Locale || this.$l2.code,
              video.l2Name,
              this.$l1.code === "zh" ? "zh-Hans" : this.$l1.code, // tlang
              true, // forceRefresh
              useGenerated // get generated subs only if we don't have L2 subs (subs we uploaded)
            );
          }
        }
        if (subs_l1) Vue.set(this.video, "subs_l1", subs_l1);
        this.onL1TranscriptLoaded();
      }
    },
    onL1TranscriptLoaded() {
      this.updateLayout();
    },
    updateDuration(duration) {
      this.duration = duration;
    },
    updateTranslation(translation) {
      let translationLines = translation.split("\n").filter((t) => t !== "");
      if (translationLines.length > 0 && this.video.subs_l2) {
        let subs_l1 = this.video.subs_l2.map((line, lineIndex) => {
          if (line && translationLines[lineIndex])
            return {
              starttime: line.starttime,
              line: translationLines[lineIndex],
              l1: this.$l1.code,
            };
        });
        Vue.set(this.video, "subs_l1", subs_l1);
      }
    },
    updateOriginalText(text) {
      let textLines = text.split("\n").filter((t) => t !== "");
      let subs_l2;
      if (
        textLines.length > 0 &&
        (!this.video.subs_l2 || this.video.subs_l2.length === 0)
      ) {
        let duration = this.$refs.youtube.getDuration();
        let increment = duration / textLines.length;
        subs_l2 = textLines.map((line, lineIndex) => {
          return {
            starttime: increment * lineIndex,
            line,
          };
        });
      } else {
        subs_l2 = textLines.map((line, lineIndex) => {
          if (this.video.subs_l2[lineIndex]) {
            return {
              starttime: this.video.subs_l2[lineIndex].starttime,
              line,
            };
          }
        });
      }
      Vue.set(this.video, "subs_l2", subs_l2);
    },
    toggleShowSubsEditing(showSubsEditing) {
      this.showSubsEditing = showSubsEditing;
      if (this.$refs.videoAdmin1)
        this.$refs.videoAdmin1.showSubsEditing = showSubsEditing;
      if (this.$refs.videoAdmin2)
        this.$refs.videoAdmin2.showSubsEditing = showSubsEditing;
    },
    toggleEnableTranslationEditing(enableTranslationEditing) {
      this.enableTranslationEditing = enableTranslationEditing;
      if (this.$refs.videoAdmin1)
        this.$refs.videoAdmin1.enableTranslationEditing =
          enableTranslationEditing;
      if (this.$refs.videoAdmin2)
        this.$refs.videoAdmin2.enableTranslationEditing =
          enableTranslationEditing;
    },
    updateEnded(ended) {
      if (ended !== this.ended) {
        this.ended = ended;
        this.$emit("ended", this.ended);
      }
      if (this.$refs.transcript) this.$refs.transcript.ended = ended;
    },
    updatePaused(paused) {
      if (paused !== this.paused) {
        this.paused = paused;
        this.$emit("paused", this.paused);
      }
      if (this.$refs.transcript) this.$refs.transcript.paused = paused;
    },
    updateCurrentTime(currentTime) {
      if (this.neverPlayed) {
        this.neverPlayed = false;
        if (this.layout !== "vertical" && this.$refs["transcript"])
          this.$refs["transcript"].scrollTo(
            this.$refs.transcript.currentLineIndex
          );
      }
      if (this.currentTime !== currentTime) {
        this.currentTime = currentTime;
        this.$emit("currentTime", this.currentTime);
      }
      if (this.$refs.transcript) {
        this.$refs.transcript.currentTime = currentTime;
        if (this.$refs.videoControls) {
          this.$refs.videoControls.currentLine =
            this.$refs.transcript.currentLine;
        }
      }
      if (this.$refs.videoControls) {
        this.$refs.videoControls.currentTime = currentTime;
      }
    },
    goToPreviousLine() {
      if (this.$refs.transcript) this.$refs.transcript.goToPreviousLine();
    },
    goToNextLine() {
      if (this.$refs.transcript) this.$refs.transcript.goToNextLine();
    },
    goToLine(line) {
      if (this.$refs.transcript) this.$refs.transcript.goToLine(line);
    },
    rewind() {
      if (this.video.subs_l2[this.startLineIndex]) {
        let starttime = this.video.subs_l2[this.startLineIndex].starttime;
        this.seekYouTube(starttime);
      } else if (this.$refs.transcript) this.$refs.transcript.rewind();
    },
    pause() {
      this.$refs.youtube.pause();
    },
    togglePaused() {
      this.$refs.youtube.togglePaused();
    },
    async play() {
      if (this.audioMode) {
        if (this.speaking) {
          this.$refs.transcript.stopAudioModeStuff();
        } else {
          this.$refs.transcript.doAudioModeStuff();
        }
      } else {
        this.$refs.youtube.play();
        this.$refs.transcript.preventCurrentTimeUpdate = true;
        await timeout(500);
        this.$refs.transcript.preventCurrentTimeUpdate = false;
      }
    },
    speechStart() {
      this.$emit("speechStart");
      this.speaking = true;
    },
    speechEnd() {
      this.$emit("speechEnd");
      this.speaking = false;
    },
    getHighlightStartTime(term) {
      let matchedLines = this.video.subs_l2.filter((line) =>
        line.line.includes(term)
      );
      if (matchedLines.length > 0) {
        return matchedLines[0].starttime;
      }
    },
    getHighlightLineIndex(term) {
      return this.video.subs_l2.findIndex((line) => line.line.includes(term));
    },
    seekYouTube(starttime) {
      this.$refs.youtube.seek(starttime);
    },
    toggleFullscreenMode() {
      this.layout = this.layout === "horizontal" ? "vertical" : "horizontal";
      this.$store.dispatch("settings/setGeneralSettings", {
        layout: this.layout,
      });
      this.$emit("updateLayout", this.layout);
    },
  },
};
</script>

<style lang="scss" scoped>
.youtube-with-transcript-mini {
  display: flex;
  .main-dark {
    background: rgba(0, 0, 0, 0.5);
  }
  .youtube-video-column {
    height: 5rem;
    width: 8.88rem;
    max-width: 8.88rem;
    margin-right: 5rem;
    :deep(.video-controls) {
      position: absolute;
      top: 0.7rem;
      left: 9.5rem;
      .video-controls-progress,
      .btn-video-controls-previous-line,
      .btn-video-controls-next-line,
      .btn-video-controls-rewind,
      // .btn-video-controls-previous,
      .btn-video-controls-speed,
      // .btn-video-controls-next,
      .btn-video-controls-fullscreen {
        display: none !important;
      }
    }
  }
  .youtube-transcript-column {
    flex: 1;
    display: flex;
    align-items: center;
    .synced-transcript {
      width: 100%;
    }
    .youtube-video-info {
      display: none;
    }
  }
}

.subs-drop.drop.over {
  border: 2px dashed #ccc;
}

.youtube-video-wrapper {
  max-width: calc((100vh - 3rem - env(safe-area-inset-top) - 12rem) * 16 / 9);
  margin: 0 auto;
  position: sticky;
  top: calc(env(safe-area-inset-top, 0) + 2.7rem);
}

.zerotohero-not-wide {
  .youtube-video-wrapper {
    max-width: calc(
      (100vh - 3rem - env(safe-area-inset-top) - 12rem - 4.625rem) * 16 / 9
    );
  }
  .youtube-with-transcript-vertical.youtube-with-transcript-auto-size {
    height: calc(
      100vh - 3rem - env(safe-area-inset-top) - env(safe-area-inset-bottom) -
        4.75rem
    );
  }
}

.youtube-with-transcript-horizontal {
  .youtube-video-column {
    position: sticky;
    top: 0;
    z-index: 2;
  }
}

.youtube-with-transcript-vertical.youtube-with-transcript-auto-size {
  display: flex;
  height: calc(
    100vh - 3rem - env(safe-area-inset-top) - env(safe-area-inset-bottom)
  );
  flex-direction: column;
  .youtube-video-column {
    flex: 0;
  }
  .youtube-transcript-column {
    flex: 1;
    :deep(.synced-transcript) {
      height: 100%;
    }
    :deep(.transcript-wrapper) {
      height: 100%;
    }
    :deep(.transcript-line) {
      height: 100%;
      overflow: hidden;
    }
  }
}

#zerotohero {
  .youtube-with-transcript-horizontal .youtube-video-column {
    top: calc(env(safe-area-inset-top, 0) + 2.7rem);
  }
}

.youtube-video-info {
  padding-left: 0.667rem;
  padding-right: 0.667rem;
}

.youtube-with-transcript-horizontal-landscape {
  display: flex;
  .youtube-video-column,
  .youtube-transcript-column {
    flex: 1;
  }
}

.youtube-transcript-column {
  width: 100%;
}

.youtube-video-info {
  padding-left: 1rem;
  padding-right: 1rem;
}
</style>