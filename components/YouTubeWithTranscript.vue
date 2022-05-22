<template>
  <div
    :class="`youtube-with-transcript youtube-with-transcript-${layout} ${
      layout === 'horizontal'
        ? 'youtube-with-transcript-horizontal-' +
          (landscape ? 'landscape' : 'portrait')
        : ''
    }`"
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
          @paused="updatePaused"
          @currentTime="updateCurrentTime"
          @ended="updateEnded"
          @duration="updateDuration"
          @videoUnavailable="onVideoUnavailable"
          :speed="speed"
          :youtube="video.youtube_id"
          :starttime="start"
          :autoload="autoload"
          :autoplay="autoplay"
          :startAtRandomTime="startAtRandomTime"
          :class="{ 'd-none': collapsed }"
        />
        <LazyVideoControls
          v-if="showControls && video"
          :video="video"
          :paused="paused"
          :layout="layout"
          :showFullscreenToggle="showFullscreenToggle"
          :showLineList="showLineList"
          :showCollapse="layout === 'horizontal'"
          ref="videoControls"
          :class="`${
            neverPlayed && layout === 'horizontal' ? 'transparent' : ''
          }`"
          :episodes="episodes"
          @goToLine="goToLine"
          @togglePaused="togglePaused"
          @rewind="rewind"
          @updateCollapsed="(c) => (this.collapsed = c)"
          @updateAudioMode="(a) => (this.audioMode = a)"
          @updateSpeed="(s) => (speed = s)"
          @toggleFullscreenMode="toggleFullscreenMode"
          @updateRepeatMode="(r) => (this.repeatMode = r)"
          @goToPreviousLine="$refs.transcript.goToPreviousLine()"
          @goToNextLine="$refs.transcript.goToNextLine()"
        />
      </div>
    </div>
    <div class="youtube-transcript-column">
      <div
        class="youtube-video-info youtube-video-info-top"
        v-if="layout === 'horizontal'"
      >
        <h3
          :class="{
            h4: video.title.length > 30,
            h5: video.title.length > 60,
          }"
          style="line-height: 1.5"
        >
          <span v-if="video" :key="`video-title-${video.title}`">
            <Annotate
              :phonetics="false"
              :buttons="false"
              v-if="$l2.code !== 'tlh' && $l2.direction !== 'rtl'"
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
        />
        <EpisodeNav
          :video="video"
          :episodes="episodes"
          :showType="showType"
          :skin="skin"
          :show="show"
          class="mt-3"
        />
      </div>

      <SyncedTranscript
        v-if="layout !== 'mini' && video.subs_l2 && video.subs_l2.length > 0"
        ref="transcript"
        :key="'transcript-' + video.youtube_id"
        :lines="video.subs_l2"
        :parallellines="video.subs_l1"
        :sticky="sticky"
        :startLineIndex="startLineIndex"
        :stopLineIndex="stopLineIndex"
        :showSubsEditing="showSubsEditing"
        :enableTranslationEditing="enableTranslationEditing"
        :notes="video.notes"
        :collapsed="collapsed"
        :skin="skin"
        :landscape="landscape"
        :single="['vertical', 'mini'].includes(layout)"
        @seek="seekYouTube"
        @pause="pause"
        @play="play"
        @speechStart="speechStart"
        @speechEnd="speechEnd"
        @updateTranslation="updateTranslation"
      />

      <div
        class="mt-5 youtube-video-info youtube-video-info-bottom"
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
        <EpisodeNav
          :video="video"
          :skin="skin"
          :episodes="episodes"
          :show="show"
          :showType="showType"
          class="mb-5"
        />
        <VideoAdmin
          v-if="$adminMode"
          :class="{ 'mt-5': true }"
          :video="video"
          ref="videoAdmin2"
          @showSubsEditing="toggleShowSubsEditing"
          @updateTranslation="updateTranslation"
          @updateOriginalText="updateOriginalText"
          @enableTranslationEditing="toggleEnableTranslationEditing"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import YouTube from "@/lib/youtube";

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
    episodes: {
      type: Array,
    },
    layout: {
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
  },
  data() {
    return {
      speaking: false,
      transcriptKey: 0,
      neverPlayed: true,
      paused: true,
      repeatMode: false,
      audioMode: false,
      showSubsEditing: false,
      enableTranslationEditing: false,
      currentTime: 0,
      videoInfoKey: 0,
      speed: 1,
      collapsed: false,
      duration: undefined,
      viewportWidth: undefined,
      viewportHeight: undefined,
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
    start() {
      let starttime =
        this.video.subs_l2 &&
        this.video.subs_l2.length > 0 &&
        this.startLineIndex &&
        this.video.subs_l2 &&
        this.video.subs_l2[this.startLineIndex]
          ? this.video.subs_l2[this.startLineIndex].starttime
          : this.starttime;
      return starttime;
    },
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
    landscape() {
      if (this.forcePortrait) return false;
      if (process.browser && this.viewportWidth && this.viewportHeight) {
        let landscape = this.viewportWidth > this.viewportHeight;
        return landscape;
      }
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
    this.updateLayout();
    await this.getL1Transcript();
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
  },
  methods: {
    onVideoUnavailable(youtube_id) {
      if (youtube_id) {
        this.$emit("videoUnavailable", youtube_id);
      }
    },
    updateLayout() {
      this.viewportWidth = this.$el.clientWidth;
      this.viewportHeight = window.innerHeight;
    },
    async getL1Transcript() {
      if (this.$l2.code === this.$l1.code) return;
      let video = this.video;
      if (!video) return;
      let missingSubsL1 = !this.video.subs_l1;
      if (missingSubsL1) {
        console.log(
          `YouTube with Transcript: Getting available transcripts...`
        );
        video = await YouTube.getYouTubeSubsListAndAddLocale(
          video,
          this.$l1,
          this.$l2
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
            this.$l1.code === "zh" ? "zh-Hans" : this.$l1.code
          );
          if (!subs_l1 || !subs_l1[0]) {
            subs_l1 = await YouTube.getTranslatedTranscript(
              video.youtube_id,
              video.l2Locale,
              video.l2Name,
              this.$l1.code === "zh" ? "zh-Hans" : this.$l1.code,
              true
            );
          }
        }
        if (subs_l1) Vue.set(this.video, "subs_l1", subs_l1);
      }
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
        this.$refs.videoControls.currentLine =
          this.$refs.transcript.currentLine;
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
    play() {
      this.$refs.youtube.play();
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
    pause() {
      this.$refs.youtube.pause();
    },
    togglePaused() {
      if (this.audioMode) {
        if (!this.paused) {
          this.$refs.youtube.pause();
        } else {
          if (this.speaking) {
            this.$refs.transcript.stopAudioModeStuff();
          } else {
            this.$refs.transcript.doAudioModeStuff();
          }
        }
      } else {
        this.$refs.youtube.togglePaused();
      }
    },
    toggleFullscreenMode() {
      this.layout = this.layout === "horizontal" ? "vertical" : "horizontal";
      this.$emit("updateLayout", this.layout);
    },
  },
};
</script>

<style lang="scss" scoped>
.youtube-with-transcript-mini {
  display: flex;
  .main-dark {
    background: rgba(0,0,0,0.5);
  }
  .youtube-video-column {
    height: 5rem;
    width: 8.88rem;
    max-width: 8.88rem;
    margin-right: 5rem;
    ::v-deep .quick-access-buttons {
      position: absolute;
      left: 9.4rem;
      top: 1rem;
      background: none;
      height: 3.2rem;


      .quick-access-button-rewind,
      .quick-access-button-previous,
      .quick-access-button-speed,
      .quick-access-button-next,
      .quick-access-button-fullscreen {
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
  max-width: calc((100vh - 10rem) * 16 / 9);
  margin: 0 auto;
  position: sticky;
  top: calc(env(safe-area-inset-top, 0) + 2.7rem);
}

.zerotohero-wide {
  .youtube-video-wrapper {
    top: 0;
  }
}

.youtube-with-transcript-horizontal {
  .youtube-video-column {
    position: sticky;
    top: 0;
    z-index: 2;
  }
}

#zerotohero:not(.zerotohero-wide) {
  .youtube-with-transcript-horizontal .youtube-video-column {
    top: calc(env(safe-area-inset-top, 0) + 2.7rem);
  }
}

.youtube-video-info {
  padding-left: 0.667rem;
  padding-right: 0.667rem;
  padding-top: 0.667rem;
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