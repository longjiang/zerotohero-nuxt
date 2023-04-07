<template>
  <div
    :class="`video-with-transcript video-with-transcript-${layout} ${
      layout === 'horizontal'
        ? 'video-with-transcript-horizontal-' +
          (landscape ? 'landscape' : 'portrait')
        : ''
    } ${useAutoTextSize ? 'video-with-transcript-auto-size' : ''}`"
  >
    <div
      :class="{
        'video-column col-sm-12 p-0': true,
        'order-2': landscape && $l2.direction === 'rtl',
      }"
    >
      <div class="video-wrapper" :key="`video-${type}-${video.youtube_id}`">
        <LazyVideo
          ref="video"
          :class="{ 'd-none': collapsed }"
          v-bind="{
            type,
            speed,
            cc,
            autoload,
            autoplay,
            startAtRandomTime,
            video,
            controls: false,
            starttime: startTimeOrLineIndex,
          }"
          @paused="onPaused"
          @updateVideo="onUpdateVideo"
          @currentTime="onCurrentTime"
          @ended="onEnded"
          @duration="onDuration"
          @videoUnavailable="onVideoUnavailable"
          @l1TranscriptLoaded="onL1TranscriptLoaded"
        />
        <LazyVideoControls
          v-if="showControls && (video.youtube_id || video.url)"
          ref="videoControls"
          v-bind="{
            video,
            paused,
            layout,
            show,
            showType,
            largeEpisodeCount,
            episodes,
            showLineList,
            showFullscreenToggle,
            showInfoButton,
            showOpenButton,
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
          @seek="seek"
          @open="onOpen"
          @updateCollapsed="(c) => (this.collapsed = c)"
          @updateAudioMode="(a) => (this.audioMode = a)"
          @updateSpeed="(s) => (speed = s)"
          @toggleFullscreenMode="toggleFullscreenMode"
          @updateSmoothScroll="(r) => (this.useSmoothScroll = r)"
          @updateAutoPause="(r) => (this.autoPause = r)"
          @updateRepeatMode="(r) => (this.repeatMode = r)"
          @goToPreviousLine="
            $refs.transcript ? $refs.transcript.goToPreviousLine() : null
          "
          @goToNextLine="
            $refs.transcript ? $refs.transcript.goToNextLine() : null
          "
        />
        <div v-if="landscape" class="pl-3 pt-4">
          <div class="video-info video-info-top" v-if="layout === 'horizontal'">
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
              v-if="type === 'youtube'"
              :showVideoDetails="true"
              :showTextEditing="true"
              :video="video"
              ref="videoAdmin1"
              @showSubsEditing="onShowSubsEditing"
              @updateTranslation="onUpdateTranslation"
              @updateOriginalText="onUpdateOriginalText"
              @enableTranslationEditing="onEnableTranslationEditing"
              @updateTranscript="onUpdateTranscript"
            />
            <EpisodeNav
              v-if="episodes"
              :video="video"
              :episodes="episodes"
              :showType="showType"
              :skin="skin"
              :show="show"
              :largeEpisodeCount="largeEpisodeCount"
              class="mt-3"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="video-transcript-column">
      <!-- this is necessary for updating the transcript upon srt drop -->
      <div class="d-none">{{ transcriptKey }}</div>

      <div class="pl-4 pr-4" v-if="video && !video.subs_l2">
        <VideoAdmin
          :showVideoDetails="true"
          :showTextEditing="true"
          :video="video"
          ref="videoAdmin1"
          @showSubsEditing="onShowSubsEditing"
          @updateTranslation="onUpdateTranslation"
          @updateOriginalText="onUpdateOriginalText"
          @enableTranslationEditing="onEnableTranslationEditing"
          @updateTranscript="onUpdateTranscript"
        />
      </div>
      <SyncedTranscript
        v-if="video.subs_l2 && video.subs_l2.length > 0"
        ref="transcript"
        :class="{ 'd-none': layout === 'mini' }"
        :key="`transcript-${type}-${video.youtube_id}-${transcriptKey}`"
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
        }"
        @seek="seek"
        @pause="pause"
        @play="play"
        @speechStart="onSpeechStart"
        @speechEnd="onSpeechEnd"
        @updateTranslation="onUpdateTranslation"
      />
      <div class="video-info video-info-bottom" v-if="layout === 'horizontal'">
        <div class="text-center mt-5 mb-5" v-if="video.checkingSubs">
          <Loader :sticky="true" message="Loading subtitles..." />
        </div>
        <div
          class="mt-4 mb-5 rounded"
          style="color: rgba(136, 136, 136, 0.85)"
          v-if="
            type !== 'bring-your-own' &&
            (!video.subs_l2 || video.subs_l2.length === 0) &&
            !video.checkingSubs
          "
        >
          <h6>
            {{
              $t("This video does not have closed captions (CC) in {l2}.", {
                l2: $t($l2.name),
              })
            }}
          </h6>
          <div class="mt-3">
            <i18n
              path="If you have the subtitles file (.srt or .ass), you can add it by uploading in the Video Information area. The Video Information area can be accessed by pressing the {0} Info or {1} Episode Select button in the video controls."
            >
              <i class="fa-solid fa-circle-info mr-1"></i>
              <i class="fa-regular fa-rectangle-history mr-1"></i>
            </i18n>
          </div>
        </div>
        <client-only>
          <EpisodeNav
            v-if="episodes"
            :video="video"
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
            @showSubsEditing="onShowSubsEditing"
            @updateTranslation="onUpdateTranslation"
            @updateOriginalText="onUpdateOriginalText"
            @updateTranscript="onUpdateTranscript"
            @enableTranslationEditing="onEnableTranslationEditing"
          />
        </client-only>
        <div
          v-if="type === 'youtube' && related && related.length > 0"
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
import { timeout } from "@/lib/utils";

export default {
  props: {
    type: {
      type: String,
      default: "youtube", // or 'bring-your-own'
    },
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
    showOpenButton: {
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
    related: Array,
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
    };
  },
  computed: {
    pro() {
      return !this.$directus.subscriptionExpired()
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
    if (this.$refs.video) this.$refs.video.speed = this.speed;
  },
  watch: {
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
        this.$refs.video &&
        this.$refs.video.player &&
        this.$refs.video.player.seekTo
      ) {
        this.rewind();
      }
    },
    initialLayout() {
      this.layout = this.initialLayout;
    },
  },
  methods: {
    onUpdateVideo(video) {
      this.$emit("updateVideo", video);
    },
    onL1TranscriptLoaded() {
      this.updateLayout();
    },
    onOpen() {
      const video = this.$refs.video;
      if (video) video.open();
    },
    onCurrentTime(currentTime) {
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
    onDuration(duration) {
      this.duration = duration;
    },
    onEnableTranslationEditing(enableTranslationEditing) {
      this.enableTranslationEditing = enableTranslationEditing;
      if (this.$refs.videoAdmin1)
        this.$refs.videoAdmin1.enableTranslationEditing =
          enableTranslationEditing;
      if (this.$refs.videoAdmin2)
        this.$refs.videoAdmin2.enableTranslationEditing =
          enableTranslationEditing;
    },

    onEnded(ended) {
      if (ended !== this.ended) {
        this.ended = ended;
        this.$emit("ended", this.ended);
      }
      if (this.$refs.transcript) this.$refs.transcript.ended = ended;
    },
    onPaused(paused) {
      if (paused !== this.paused) {
        this.paused = paused;
        this.$emit("paused", this.paused);
      }
      if (this.$refs.transcript) this.$refs.transcript.paused = paused;
    },
    goToLine(line) {
      if (this.$refs.transcript) this.$refs.transcript.goToLine(line);
    },

    pause() {
      this.$refs.video.pause();
    },

    async play() {
      if (this.audioMode) {
        if (this.speaking) {
          this.$refs.transcript.stopAudioModeStuff();
        } else {
          this.$refs.transcript.doAudioModeStuff();
        }
      } else {
        this.$refs.video.play();
        if (this.$refs.transcript) {
          this.$refs.transcript.preventCurrentTimeUpdate = true;
          await timeout(500);
          this.$refs.transcript.preventCurrentTimeUpdate = false;
        }
      }
    },

    rewind() {
      if (this.video.subs_l2[this.startLineIndex]) {
        let starttime = this.video.subs_l2[this.startLineIndex].starttime;
        this.seek(starttime);
      } else if (this.$refs.transcript) this.$refs.transcript.rewind();
    },
    seek(starttime) {
      this.$refs.video.seek(starttime);
    },

    onShowSubsEditing(showSubsEditing) {
      this.showSubsEditing = showSubsEditing;
      if (this.$refs.videoAdmin1)
        this.$refs.videoAdmin1.showSubsEditing = showSubsEditing;
      if (this.$refs.videoAdmin2)
        this.$refs.videoAdmin2.showSubsEditing = showSubsEditing;
    },
    onSpeechEnd() {
      this.$emit("speechEnd");
      this.speaking = false;
    },

    onSpeechStart() {
      this.$emit("speechStart");
      this.speaking = true;
    },

    onUpdateOriginalText(text) {
      let textLines = text.split("\n").filter((t) => t !== "");
      let subs_l2;
      if (
        textLines.length > 0 &&
        (!this.video.subs_l2 || this.video.subs_l2.length === 0)
      ) {
        let duration = this.$refs.video.getDuration();
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

    onUpdateTranscript() {
      this.transcriptKey++;
    },
    onUpdateTranslation(translation) {
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

    onVideoUnavailable(youtube_id) {
      if (youtube_id === this.video.youtube_id) {
        this.$emit("videoUnavailable", youtube_id);
      }
    },
    togglePaused() {
      this.$refs.video.togglePaused();
    },
    updateLayout() {
      this.viewportWidth = this.$el.clientWidth;
      this.viewportHeight = window.innerHeight;
    },
    goToPreviousLine() {
      if (this.$refs.transcript) this.$refs.transcript.goToPreviousLine();
    },
    goToNextLine() {
      if (this.$refs.transcript) this.$refs.transcript.goToNextLine();
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
.video-with-transcript-mini {
  display: flex;
  .main-dark {
    background: rgba(0, 0, 0, 0.5);
  }
  .video-column {
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
      .btn-video-controls-info,
      .btn-video-controls-speed,
      .btn-video-controls-fullscreen {
        display: none !important;
      }
    }
  }
  .video-transcript-column {
    flex: 1;
    display: flex;
    align-items: center;
    .synced-transcript {
      width: 100%;
    }
    .video-info {
      display: none;
    }
  }
}

.subs-drop.drop.over {
  border: 2px dashed #ccc;
}

.video-wrapper {
  max-width: calc((100vh - 3rem - env(safe-area-inset-top) - 12rem) * 16 / 9);
  margin: 0 auto;
  position: sticky;
  top: calc(env(safe-area-inset-top, 0) + 2.7rem);
}

.zerotohero-not-wide {
  .video-wrapper {
    max-width: calc(
      (100vh - 3rem - env(safe-area-inset-top) - 12rem - 4.625rem) * 16 / 9
    );
  }
  .video-with-transcript-vertical.video-with-transcript-auto-size {
    height: calc(
      100vh - 3rem - env(safe-area-inset-top) - env(safe-area-inset-bottom) -
        4.75rem
    );
  }
}

.video-with-transcript-horizontal {
  .video-column {
    position: sticky;
    top: 0;
    z-index: 2;
  }
}

.video-with-transcript-vertical.video-with-transcript-auto-size {
  display: flex;
  height: calc(
    100vh - 3rem - env(safe-area-inset-top) - env(safe-area-inset-bottom)
  );
  flex-direction: column;
  .video-column {
    flex: 0;
  }
  .video-transcript-column {
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
  .video-with-transcript-horizontal .video-column {
    top: calc(env(safe-area-inset-top, 0) + 2.7rem);
  }
}

.video-info {
  padding-left: 0.667rem;
  padding-right: 0.667rem;
}

.video-with-transcript-horizontal-landscape {
  display: flex;
  .video-column,
  .video-transcript-column {
    flex: 1;
  }
}

.video-transcript-column {
  width: 100%;
}

.video-info {
  padding-left: 1rem;
  padding-right: 1rem;
}
</style>