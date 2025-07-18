<template>
  <div
    :class="{
      'video-with-transcript': true,
      'text-auto-size': useAutoTextSize,
      overlay: useOverlay,
      collapsed,
      hovering,
      'hide-cursor': !hovering,
      [`size-${size}`]: true,
      [`mode-${(forceMode || mode)}`]: true,
      [`aspect-${aspect}`]: true,
    }"
    @mouseenter="handleMouseMove"
    @mouseleave="handleMouseMove"
    @mousemove="handleMouseMove"
    @touchstart.passive="resetHoverTimeout"
    @touchend="resetHoverTimeout"
  >
    <div class="video-with-transcript-inner">
      <div
        :class="{
          'video-wrapper col-sm-12 p-0': true,
          'order-2': $l2.direction === 'rtl' && aspect === 'landscape' && size !== 'mini',
        }"
        :key="`video-${type}-${video.youtube_id}`"
      >
        <LazyVideo
          ref="video"
          :class="{ 'd-none': collapsed }"
          v-bind="{
            type,
            speed,
            cc,
            autoload,
            autoplay: false,
            startAtRandomTime,
            video,
            formats,
            controls: false,
            starttime,
          }"
          @paused="onPaused"
          @updateVideo="onUpdateVideo"
          @currentTime="onCurrentTime"
          @ended="onEnded"
          @duration="onDuration"
          @videoUnavailable="onVideoUnavailable"
          @loaded="onLoaded"
        />
        <LazyVideoControls
          v-if="showControls && (video.youtube_id || video.url)"
          :class="{
            'video-controls': true,
            overlay: useOverlay,
            shown: overlayControlsVisible,
          }"
          ref="videoControls"
          v-bind="{
            duration,
            episodes,
            episodeSort,
            fullscreen,
            size,
            initialTime: starttime ? starttime : 0,
            largeEpisodeCount,
            mode,
            forceMode,
            paused,
            show,
            showCollapse: mode === 'transcript',
            showFullscreenToggle,
            showInfoButton,
            showLineList,
            showOpenButton,
            showType,
            skin: useOverlay ? 'dark' : $skin,
            video,
            playlist
          }"
          @previous="$emit('previous')"
          @next="$emit('next')"
          @goToLine="goToLine"
          @play="play"
          @pause="pause"
          @rewind="rewind"
          @fastforward="fastfowrard"
          @seek="seek"
          @open="onOpen"
          @updateCollapsed="(c) => (this.collapsed = c)"
          @updateAudioMode="(a) => (this.audioMode = a)"
          @updateSpeed="(s) => (speed = s)"
          @updateTranscriptMode="(t) => (this.mode = t ? 'transcript' : 'subtitles')"
          @updateSmoothScroll="(r) => (this.useSmoothScroll = r)"
          @updateAutoPause="(r) => (this.autoPause = r)"
          @updateRepeatMode="(r) => (this.repeatMode = r)"
          @retranslate="$emit('retranslate', video)"
          @fullscreen="onFullscreen"
          @goToPreviousLine="
            $refs.transcript ? $refs.transcript.goToPreviousLine() : null
          "
          @goToNextLine="
            $refs.transcript ? $refs.transcript.goToNextLine() : null
          "
        />
        <div
          class="video-info video-info-side pl-3 pt-2"
          v-if="
            aspect === 'landscape' &&
            size !== 'mini' &&
            (forceMode || mode) === 'transcript' &&
            !collapsed
          "
        >
          <VideoAdmin
            v-if="$adminMode && type === 'youtube'"
            :showTextEditing="true"
            :video="video"
            ref="videoAdminBelowVideo"
            @showSubsEditing="onShowSubsEditing"
            @updateTranslation="onUpdateTranslation"
            @updateOriginalText="onUpdateOriginalText"
            @enableTranslationEditing="onEnableTranslationEditing"
            @updateTranscript="onUpdateTranscript"
          />
          <VideoDetails
            v-if="type === 'youtube'"
            :video="video"
            ref="videoDetails"
            @updateVideo="onUpdateVideo"
            @retranslate="$emit('retranslate', video)"
          />
          <EpisodeNav
            v-if="episodes"
            class="mt-3"
            v-bind="{
              video,
              skin,
              episodes,
              episodeSort,
              show,
              showType,
              largeEpisodeCount,
            }"
          />
        </div>
      </div>
      <div
        :class="{
          'video-transcript-wrapper': true,
          [`align-subs-${overlaySubsAlign}`]: useOverlay,
          'controls-shown': overlayControlsVisible,
          overlay: useOverlay,
        }"
        ref="videoTranscriptWrapper"
      >
        <!-- this is necessary for updating the transcript upon srt drop -->
        <div class="d-none">{{ transcriptKey }}</div>

        <div
          :class="{ 'drag-handle': true, 'd-none': !useOverlay }"
          @click="
            overlaySubsAlign = overlaySubsAlign === 'top' ? 'bottom' : 'top'
          "
        >
          <i
            class="fa-solid fa-arrow-up-to-line"
            v-if="overlaySubsAlign === 'bottom'"
          ></i>
          <i
            class="fa-solid fa-arrow-down-to-line"
            v-if="overlaySubsAlign === 'top'"
          ></i>
        </div>

        <div
          class="video-info video-info-top"
          v-if="(forceMode || mode) === 'transcript' && size !== 'mini'"
        >
          <div class="px-3">
            <TokenizedRichText
              v-if="showDescription"
              ref="tokenizedRichTexts"
              class="mt-2"
            >
              <div>
                <p v-for="(line, index) in video.description.split('\n')" :key="index">{{ line }}</p>
              </div>
            </TokenizedRichText>
            <b-button variant="outline-secondary" class="w-100" @click="showDescription = !showDescription">
              {{ showDescription ? 'Hide Description' : 'Show Description' }} <i class="fa-solid fa-angle-down" v-if="!showDescription"></i><i class="fa-solid fa-angle-up" v-if="showDescription"></i>
            </b-button>
          </div>
        </div>
        
        <!-- This is the public facing video admin -->
        <!-- If the video has no subs, allow the user to add subs -->
        <div class="pl-4 pr-4" v-if="!checkingSubs && type == 'youtube' && video && !video.subs_l2">
          <VideoAdmin
            :showVideoDetails="true"
            :showTextEditing="true"
            :video="video"
            ref="videoAdminAboveTranscript"
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
          :class="{ 'd-none': size === 'mini' }"
          :key="`transcript-${type}-${video.youtube_id}-${transcriptKey}`"
          v-bind="{
            lines: video.subs_l2 || [],
            parallellines: video.subs_l1 || [],
            starttime,
            currentTime,
            single: (forceMode || mode) === 'subtitles' || size === 'mini',
            showAnimation,
            showSubsEditing,
            showQuiz,
            enableTranslationEditing,
            sticky,
            speed,
            notes: video.notes,
            collapsed,
            startLineIndex,
            skin: useOverlay ? 'dark' : skin,
            textSize,
            landscape: aspect === 'landscape',
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
        <div
          class="video-info video-info-bottom"
          v-if="(forceMode || mode) === 'transcript' && size !== 'mini'"
        >
          <div class="text-center mt-2 mb-2" v-show="checkingSubs">
            <Loader :sticky="true" message="Loading subtitles..." />
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
              :skin="skin"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * VideoWithTranscript component has different layout variants based on size, mode, and aspect.
 *
 * Size variants:
 * - 'regular': default size, takes up a portion of the screen
 * - 'fullscreen': takes up the entire screen, hiding SiteTopBar and Nav bar
 * - 'mini': displays the video as a mini bar at the bottom of the app
 *
 * Mode variants:
 * - 'transcript': displays multiple lines of transcript
 * - 'subtitles': displays only the current line of transcript
 *
 * Aspect variants:
 * - 'landscape': for desktop monitors or rotated phones
 * - 'portrait': for phones or tablets in the vertical orientation
 *
 * Layout rules:
 *
 * 1. Regular size:
 *   a. Landscape aspect:
 *     - In transcript mode: Video on the left, scrolling transcript on the right
 *        - If the video is collapsed, the transcript is displayed below the video
 *     - In subtitles mode: Video filling the entire container, video controls and the current line of the transcript overlaying the video near the bottom
 *   b. Portrait aspect:
 *     - In transcript mode: Video on top, scrolling transcript below the video
 *     - In subtitles mode: Video on top, current line of transcript below the video
 *
 * 2. Fullscreen size:
 *   - Hides SiteTopBar and Nav bar
 *   - Does not force screen rotation, allows users to rotate as desired
 *
 * 3. Mini size:
 *   - Displays video as a mini bar at the bottom of the app, regardless of mode and aspect
 */

import Vue from "vue";
import { timeout } from "../lib/utils";
import { mapState } from "vuex";

export default {
  props: {
    skin: {
      default: null,
    },
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
    showQuiz: {
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
    initialMode: {
      type: String,
      default: "transcript", // or 'subtitles'
    },
    initialSize: {
      type: String,
      default: "regular", // or 'fullscreen' or 'mini'
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
    starttime: {
      default: 0,
    },
    startAtRandomTime: {
      default: 0,
    },
    stopLineIndex: {
      default: -1,
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
    forceMode: {
      default: undefined,
    },
    showAnimation: {
      default: true,
    },
    useAutoTextSize: {
      default: false,
    },
    related: Array,
    checkingSubs: {
      default: false,
    },
    playlist: {
      type: Object,
    },
    episodeSort: {
      type: String,
      default: "title", // or '-views' or '-date'
    },
    formats: {
      type: Array,
      required: false,
    },
  },
  data() {
    return {
      lastMousePosition: { x: 0, y: 0 },
      audioMode: false,
      autoPause: false,
      useSmoothScroll: false,
      collapsed: false,
      currentTime: 0,
      duration: undefined,
      enableTranslationEditing: false,
      hovering: false, // If the mouse is hovering over the video
      hoverTimeout: null, // Timeout for hiding the video controls
      mode: this.initialMode,
      neverPlayed: true,
      paused: true,
      repeatMode: false,
      overlaySubsAlign: "bottom",
      showSubsEditing: false,
      speaking: false,
      startLineIndex: 0,
      speed: 1,
      textSize: 1,
      transcriptKey: 0,
      videoInfoKey: 0,
      viewportHeight: undefined,
      viewportWidth: undefined,
      videoHeightWithoutControls: undefined,
      overlayTranscriptVerticalPercentage: 0.75,
      showDescription: false,
    };
  },
  computed: {
    ...mapState("settings", ["fullscreen"]),
    /**
     * Determines if the transcript and controls should overlay the video.
     * @returns {Boolean} true if the aspect is landscape and mode is subtitles, false otherwise.
     */
    useOverlay() {
      if (
        this.aspect === "landscape" &&
        this.mode === "subtitles" &&
        this.size !== "mini" &&
        !this.collapsed
      ) {
        if (!this.hasEnoughSpaceUnderVideo()) {
          return true;
        }
      }
    },

    overlayControlsVisible() {
      return this.hovering || this.paused;
    },
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
    /**
     * Whether the video is in portrait mode or landscape mode
     * @returns {String} "portrait" or "landscape"
     */
    aspect() {
      // If forcePortrait is true, return 'portrait' (forcing portrait mode)
      if (this.forcePortrait) return "portrait";

      // If the process is running in a browser and viewport dimensions are available
      if (process.browser && this.viewportWidth && this.viewportHeight) {
        // Return "landscape" if the viewport width is greater than its height, otherwise return "portrait"
        if (this.viewportWidth > this.viewportHeight) return "landscape";
        else return "portrait";
      } else {
        // If viewport dimensions are not available, default to "landscape"
        return "landscape";
      }
    },
    size() {
      if (this.fullscreen) return "fullscreen";
      else return this.initialSize;
    },
    episodeIndex() {
      return this.episodes.findIndex(
        (v) => v.youtube_id === this.video.youtube_id
      );
    },
    pro() {
      return this.forcePro || this.$store.state.subscriptions.active;
    },
  },
  created() {
    if (process.browser) {
      window.addEventListener("resize", this.updateLayout);
    }
  },
  async mounted() {
    this.startLineIndex = this.getStartLineIndex();
    this.updateLayout();
    if (typeof this.$store.state.settings !== "undefined") {
      this.useSmoothScroll = this.$store.state.settings.useSmoothScroll;
    }
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type === "settings/LOAD_JSON_FROM_LOCAL") {
        this.useSmoothScroll = this.$store.state.settings.useSmoothScroll;
      }
    });
    const fullscreenEvents = [
      "fullscreenchange",
      "webkitfullscreenchange",
      "mozfullscreenchange",
      "MSFullscreenChange",
    ];
    fullscreenEvents.forEach((event) => {
      if (typeof document !== "undefined") document.addEventListener(event, this.updateFullscreenState);
    });
    this.updateFullscreenState();
  },
  beforeDestroy() {
    this.unsubscribe();
    window.removeEventListener("resize", this.updateLayout);
    const fullscreenEvents = [
      "fullscreenchange",
      "webkitfullscreenchange",
      "mozfullscreenchange",
      "MSFullscreenChange",
    ];
    fullscreenEvents.forEach((event) => {
      if (typeof document !== "undefined") document.removeEventListener(event, this.updateFullscreenState);
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
    starttime() {
      this.startLineIndex = this.getStartLineIndex();
      if (this.$refs.video?.$refs.concreteVideo?.player?.seekTo) {
        this.$refs.video?.$refs.concreteVideo?.player?.seekTo(this.starttime);
      }
    },
    repeatMode() {
      if (this.$refs.transcript)
        this.$refs.transcript.repeatMode = this.repeatMode;
    },
    audioMode() {
      if (this.$refs.transcript)
        this.$refs.transcript.audioMode = this.audioMode;
    },
    initialMode() {
      this.mode = this.initialMode;
    },
    'video.youtube_id'() {
      this.paused = true;
    },
    mode() {
      this.$store.dispatch("settings/setGeneralSettings", {
        mode: this.mode,
      });
      this.$emit("updateLayout", this.mode);
    },
  },
  methods: {

    getStartLineIndex() {
      if (this.video.subs_l2 && this.video.subs_l2.length > 0) {
        return this.video.subs_l2.findIndex(
          (line) => line.starttime >= this.startTimeOrLineIndex
        );
      }
    },
    getContainerElementWidth() {
      if (typeof document === "undefined") return;
      let containerElement = document.querySelector(".video-view-content");
      if (containerElement) {
        return containerElement.offsetWidth;
      }
    },

    getContainerElementHeight() {
      if (typeof document === "undefined") return;
      let containerElement = document.querySelector(".video-view-content");
      if (containerElement) {
        return containerElement.offsetHeight;
      }
    },

    getVideoHeight() {
      let containerWidth = this.getContainerElementWidth();
      if (containerWidth) {
        const videoIsFullWidth = this.mode === 'subtitles' || (this.mode === 'transcript' && this.aspect === 'portrait');
        if (videoIsFullWidth) {
          return containerWidth * 9 / 16;
        } else {
          return containerWidth * 9 / 32;
        }
      }
    },

    getControlsHeight() {
      if (this.$refs.videoControls) {
        const videoControls = this.$refs.videoControls.$el;
        return videoControls.offsetHeight;
      }
    },

    getVideoHeightWithoutControls() {
      const videoHeight = this.getVideoHeight();
      const controlsHeight = this.getControlsHeight();
      if (videoHeight && controlsHeight) return videoHeight - controlsHeight;
    },

    hasEnoughSpaceUnderVideo() {
      let containerHeight = this.getContainerElementHeight();
      if (containerHeight) {        
        let videoHeight = this.getVideoHeight();
        let controlsHeight = this.getControlsHeight();
        let spaceUnderVideo =
          (containerHeight - videoHeight - controlsHeight) / containerHeight;
        if (spaceUnderVideo > 0.10) return true;
      }
    },

    handleMouseMove(event) {
      if (event.clientX !== this.lastMousePosition.x || event.clientY !== this.lastMousePosition.y) {
        this.resetHoverTimeout();
      }
      
      this.lastMousePosition = {
        x: event.clientX,
        y: event.clientY
      };
    },
    stopHovering() {
      this.hovering = false;
      clearTimeout(this.hoverTimeout);
    },
    resetHoverTimeout() {
      clearTimeout(this.hoverTimeout);
      this.hovering = true;
      this.hoverTimeout = setTimeout(() => {
        this.hovering = false;
      }, 3000);
    },
    onUpdateVideo(video) {
      this.$emit("updateVideo", video);
    },
    onOpen() {
      this.$emit("open");
    },
    onCurrentTime(currentTime) {
      if (this.neverPlayed) {
        this.neverPlayed = false;
        if (this.mode !== "subtitles" && this.$refs["transcript"])
          this.$refs["transcript"].scrollTo(
            this.$refs.transcript.currentLineIndex
          );
      }
      if (this.currentTime !== currentTime) {
        this.currentTime = currentTime;
        this.$emit("currentTime", this.currentTime);
      }
      if (this.$refs.transcript) {
        if (this.$refs.videoControls) {
          // Transcript's current line is updated via a prop
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
    onLoaded(loaded) {
      this.$emit("loaded", loaded);
      // If autoplay is enabled, play the video
      if (this.autoplay && this.$refs.video && this.$refs.video.play) {
        this.$refs.video.play();
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

    rewind(seconds) {
      // If seconds is not defined, rewind to the beginning of the current line
      if (!seconds) {
        if (this.video.subs_l2[this.startLineIndex]) {
          let starttime = this.video.subs_l2[this.startLineIndex].starttime;
          this.seek(starttime);
        } else if (this.$refs.transcript) this.$refs.transcript.rewind();
      } else {
        // Otherwise rewind by the specified number of seconds
        this.seek(Math.max(0, this.currentTime - seconds));
      }
    },

    fastfowrard(seconds) {
      this.seek(Math.min(this.duration, this.currentTime + seconds));
    },

    seek(time) {
      if (this.$refs.video?.seek) {
        this.$refs.video.seek(time);
        this.currentTime = time
      }
    },

    onShowSubsEditing(showSubsEditing) {
      this.showSubsEditing = showSubsEditing;
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
      this.videoHeightWithoutControls = this.getVideoHeightWithoutControls();
    },
    onFullscreen(fullscreen) {
      if (fullscreen !== this.fullscreen) {
        if (fullscreen) {
          this.requestFullscreen();
        } else {
          this.exitFullscreen();
        }
      }
    },
    requestFullscreen() {
      if (typeof document === "undefined") return;
      const docEl = document.documentElement;

      if (docEl.requestFullscreen) {
        docEl.requestFullscreen();
      } else if (docEl.mozRequestFullScreen) {
        // Firefox
        docEl.mozRequestFullScreen();
      } else if (docEl.webkitRequestFullscreen) {
        // Chrome, Safari and Opera
        docEl.webkitRequestFullscreen();
      } else if (docEl.msRequestFullscreen) {
        // IE/Edge
        docEl.msRequestFullscreen();
      } else {
        this.$store.dispatch("settings/setFullscreen", true);
      }
    },
    exitFullscreen() {
      if (typeof document === "undefined") return;
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        // Firefox
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        // Chrome, Safari and Opera
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        // IE/Edge
        document.msExitFullscreen();
      } else {
        this.$store.dispatch("settings/setFullscreen", false);
      }
    },
    updateFullscreenState() {
      if (typeof document === "undefined") return;
      const fullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      this.$store.dispatch("settings/setFullscreen", fullscreen);
    },

    handleMouseDown(e) {
      if (typeof document === "undefined") return;
      const videoTranscriptWrapper = this.$refs.videoTranscriptWrapper;
      e.preventDefault();
      const startY = e.clientY;
      const startTop = parseFloat(videoTranscriptWrapper.style.top) || 0;

      const handleMouseMove = (e) => {
        e.preventDefault();
        const mouseY = e.clientY;
        const deltaY = mouseY - startY;
        let newTop = startTop + deltaY;

        // Convert to percentage
        const videoHeight = this.getVideoHeightWithoutControls();
        const transcriptHeight = this.$refs.videoTranscriptWrapper.offsetHeight;
        let newTopPercentage = (newTop / videoHeight) * 100;
        let maxNewTopPercentage =
          ((videoHeight - transcriptHeight) / videoHeight) * 100;

        // Constrain within the container
        if (newTopPercentage < 0) {
          newTopPercentage = 0;
        } else if (newTopPercentage > maxNewTopPercentage) {
          newTopPercentage = maxNewTopPercentage;
        }
        this.overlayTranscriptVerticalPercentage = newTopPercentage;

        // videoTranscriptWrapper.style.top = `${newTopPercentage}%`;
      };

      const handleMouseUp = () => {
        if (typeof document === "undefined") return;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      // Add touch event listeners
      document.addEventListener("touchmove", handleMouseMove);
      document.addEventListener("touchend", handleMouseUp);
      document.addEventListener("touchcancel", handleMouseUp);
    },

    handleTouchStart(e) {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const mouseEvent = this.convertTouchEvent(touch);
        this.handleMouseDown(mouseEvent);
      }
    },
    convertTouchEvent(touch) {
      return {
        preventDefault: () => touch.preventDefault(),
        clientY: touch.clientY,
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.video-with-transcript-inner {
  width: 100%;
  position: relative;
}

.video-with-transcript {
  position: relative;

  /* overlay mode, when controls and subtitles overlay the video */
  &.overlay {
    // height should be calculated based on the video aspect ratio 16/9
    // height: calc(100% * 9 / 16);
    // margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    background: black;
    position: relative;

    .video-transcript-wrapper {
      transition: all 0.3s ease-in-out;
    }

    .video-transcript-wrapper.align-subs-bottom {
      bottom: 6rem; // Make room for the controls
      top: auto;
      &:not(.controls-shown) {
        bottom: 1rem;
      }
    }

    .video-transcript-wrapper.align-subs-top {
      bottom: auto;
      top: 1rem;
    }

    &.size-fullscreen .video-with-transcript-inner {
      // Width should be set so that when the height is calculated it will not exceed the viewport height
      max-width: calc(100vh * 16 / 9);
    }

    &.size-regular .video-with-transcript-inner {
      // Width should be set so that when the height is calculated it will not exceed the viewport height
      max-width: calc((100vh - 2.9rem) * 16 / 9);
    }

    .video-transcript-wrapper {
      position: absolute;
      display: inline-block;
      left: 50%;
      transform: translateX(-50%);
      width: max-content;
      max-width: calc(100% - 2rem);
      border-radius: 0.25rem;
      padding: 0;
      box-sizing: border-box;
      overflow: hidden;
      text-shadow: 0 0 5px rgba(0, 0, 0, 0.8);
      background-color: #000000cc;
      padding-top: 0.75em;
      backdrop-filter: blur(7px);
      .drag-handle {
        height: calc(100% - 1rem);
        position: absolute;
        left: 1rem;
        cursor: pointer;
        z-index: 2;
        opacity: 0.5;
        color: white;
        &:hover {
          opacity: 1;
        }
      }
    }

    .video-controls {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      opacity: 0;

      &.shown {
        opacity: 1;
      }

      transition: opacity 0.3s;
      background: rgba(0, 0, 0, 0.99);

      :deep(.video-controls-time:not([disabled])),
      :deep(.btn-video-controls:not([disabled])) {
        text-shadow: 0 0 2px rgba(0, 0, 0, 0.8);
        color: white;
      }
    }
  }
}

/* Not wide display */
.zerotohero-not-wide {
  .video-with-transcript:not(.size-mini) {
    .video-wrapper {
      margin: 0 auto;
    }
  }

  .video-wrapper {
    max-width: calc(
      (
          100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom) -
            2.9rem - 4.9rem
        ) * 16 / 9
    );
  }

  .video-with-transcript.size-fullscreen {
    .video-wrapper {
      max-width: calc(
        (100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom)) * 16 /
          9
      );
    }
  }

  .video-info-side {
    display: none;
  }
}

/* Mini mode */
.video-with-transcript.size-mini {
  display: flex;

  .video-wrapper {
    height: 5rem;
    width: 8.88rem;
    max-width: 8.88rem;
    margin-right: 5rem;

    :deep(.video-controls) {
      position: absolute;
      top: 0.25rem;
      left: 9.5rem;

      .video-controls-progress,
      .btn-video-controls {
        display: none !important;
      }

      .btn-video-controls-previous,
      .btn-video-controls-play,
      .btn-video-controls-next {
        display: block !important;
      }
    }
  }
}

/* Drag and drop */
.subs-drop.drop.over {
  border: 2px dashed #ccc;
}

/* Transcript mode */
.video-with-transcript.mode-transcript {
  .video-wrapper {
    position: sticky;
    z-index: 2;
    height: 100%; // otherwise this is too tall for sticky to work
  }

  &.size-fullscreen {
    .video-wrapper {
      top: 0;
    }
  }

  &.size-regular {
    .video-wrapper {
      top: 0;
      height: inherit;
    }
  }
}

/* Subtitles mode */
.video-with-transcript:not(.overlay).mode-subtitles.text-auto-size {
  display: flex;
  height: calc(
    100vh - 3rem - env(safe-area-inset-top) - env(safe-area-inset-bottom)
  );
  flex-direction: column;

  .video-wrapper {
    flex: 0;
  }

  .video-transcript-wrapper {
    flex: 1;

    :deep(.synced-transcript) {
      height: 100%;
    }

    :deep(.transcript-wrapper) {
      height: 100%;
    }

    :deep(.transcript-line) {
      height: 100%;
    }
  }
}

/* Landscape aspect */
.video-with-transcript.mode-transcript.aspect-landscape:not(.collapsed) {
  .video-with-transcript-inner {
    display: flex;

    .video-wrapper {
      height: 100vh;
    }

    .video-wrapper,
    .video-transcript-wrapper {
      flex: 1;
    }
  }
}

/* Portrait aspect */
.video-with-transcript.mode-transcript.aspect-portrait {
  display: flex;
  flex-direction: column;

  .video-wrapper,
  .video-transcript-wrapper {
    flex: 1;
  }
}

/* Video transcript column */
.video-transcript-wrapper {
  width: 100%;
}

/* Video info */
.video-info {
  padding-left: 0.667rem;
  padding-right: 0.667rem;
}

.hide-cursor {
  cursor: none !important;
}

</style>
