<template>
  <div
    :class="{
      'container-fluid youtube-with-transcript': true,
      'youtube-with-transcript-landscape': landscape,
      'youtube-with-transcript-portrait': !landscape,
    }"
  >
    <div
      v-if="layout === 'horizontal'"
      :class="`row youtube-with-transcript-${layout}`"
    >
      <div
        :class="{
          'youtube-video-column col-sm-12 p-0': true,
          'order-2': landscape && $l2.direction === 'rtl',
        }"
      >
        <div class="youtube-video-wrapper" :key="'youtube-' + video.youtube_id">
          <YouTubeVideo
            ref="youtube"
            @paused="updatePaused"
            @currentTime="updateCurrentTime"
            @ended="updateEnded"
            @duration="updateDuration"
            :speed="speed"
            :youtube="video.youtube_id"
            :starttime="start"
            :autoload="autoload"
            :autoplay="autoplay"
            :startAtRandomTime="startAtRandomTime"
            :class="{ 'd-none': collapsed }"
          />
          <VideoControls
            v-if="showControls && video"
            :video="video"
            :paused="paused"
            :layout="layout"
            :showFullscreenToggle="showFullscreenToggle"
            :showLineList="showLineList"
            ref="videoControls"
            :class="`${neverPlayed ? 'transparent' : ''}`"
            :episodes="episodes"
            :episodeIndex="episodeIndex"
            :show="show"
            :showType="showType"
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
        <div class="youtube-video-info youtube-video-info-top">
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
                :buttons="true"
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
            :previousEpisode="previousEpisode"
            :nextEpisode="nextEpisode"
            :episodes="episodes"
            :episodeIndex="episodeIndex"
            :showType="showType"
            :skin="skin"
            :show="show"
            class="mt-3"
          />
          <div
            v-if="
              !(video && video.id) &&
              ((video.subs_l2 && video.subs_l2.length > 0) || $adminMode)
            "
            style="font-size: 0.7em; opacity: 0.7"
            class="mt-2"
          >
            Once saved, the video will be available for everyone to see. You can
            find it at
            <i class="fas fa-photo-video"></i>
            Media →
            <i class="fa fa-play"></i>
            New Videos.
          </div>
        </div>
        <div class="mt-4">
          <div v-if="video.subs_l2 && video.subs_l2.length > 0">
            <SyncedTranscript
              ref="transcript"
              :key="'transcript-' + video.youtube_id"
              :lines="video.subs_l2"
              :quiz="quiz"
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
              @seek="seekYouTube"
              @pause="pause"
              @play="play"
              @speechStart="speechStart"
              @speechEnd="speechEnd"
              @updateTranslation="updateTranslation"
            />
          </div>
          <div class="mt-5 youtube-video-info youtube-video-info-bottom">
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
              :previousEpisode="previousEpisode"
              :nextEpisode="nextEpisode"
              :skin="skin"
              :episodes="episodes"
              :show="show"
              :showType="showType"
              :episodeIndex="episodeIndex"
              class="mb-5"
            />
            <VideoAdmin
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
    </div>
    <template v-if="layout === 'vertical'">
      <div class="row video-area">
        <div style="width: 100%">
          <div class="youtube-video-wrapper">
            <YouTubeVideo
              ref="youtube"
              @paused="updatePaused"
              @currentTime="updateCurrentTime"
              @ended="updateEnded"
              @duration="updateDuration"
              :speed="speed"
              :youtube="video.youtube_id"
              :starttime="start"
              :autoload="autoload"
              :autoplay="autoplay"
              :startAtRandomTime="startAtRandomTime"
            />
            <VideoControls
              v-if="video"
              :video="showControls && video"
              :paused="paused"
              :layout="layout"
              :showFullscreenToggle="showFullscreenToggle"
              :showLineList="showLineList"
              :showCollapse="false"
              ref="videoControls"
              @goToLine="goToLine"
              @updateCollapsed="(c) => (this.collapsed = c)"
              @togglePaused="togglePaused"
              @rewind="rewind"
              @updateAudioMode="(a) => (this.audioMode = a)"
              @updateSpeed="(s) => (speed = s)"
              @toggleFullscreenMode="toggleFullscreenMode"
              @updateRepeatMode="(r) => (this.repeatMode = r)"
              @goToPreviousLine="$refs.transcript.goToPreviousLine()"
              @goToNextLine="$refs.transcript.goToNextLine()"
            />
          </div>
        </div>
      </div>
      <div class="row" v-if="video.subs_l2 && video.subs_l2.length > 0">
        <div
          :key="'transcript-' + video.youtube_id"
          class="col-sm-12 text-center mt-2 synced-transcript-wrapper"
          style="min-height: 65px"
        >
          <SyncedTranscript
            ref="transcript"
            :lines="video.subs_l2"
            :parallellines="video.subs_l1"
            :single="true"
            :quiz="false"
            :highlight="highlight"
            :hsk="hsk"
            :highlight-saved-words="false"
            :startLineIndex="startLineIndex"
            :stopLineIndex="stopLineIndex"
            :sticky="sticky"
            :notes="video.notes"
            :skin="skin"
            @seek="seekYouTube"
            @pause="pause"
            @play="play"
            @speechStart="speechStart"
            @speechEnd="speechEnd"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import Vue from "vue";
import DateHelper from "@/lib/date-helper";
import Helper from "@/lib/helper";
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
    previousEpisode: {
      type: String,
    },
    nextEpisode: {
      type: String,
    },
    episodes: {
      type: Array,
    },
    episodeIndex: {
      type: Number,
    },
    initialLayout: {
      type: String,
      default: "horizontal", // or 'vertical'
    },
    highlight: {
      type: Array,
    },
    quiz: {
      default: false,
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
      layout: this.initialLayout,
      collapsed: false,
      duration: undefined,
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
      let landscape =
        typeof window !== "undefined" && window.innerWidth > window.innerHeight;
      return landscape;
    },
  },
  async mounted() {
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
        if (this.layout !== 'vertical' && this.$refs["transcript"]) this.$refs["transcript"].scrollTo(this.$refs.transcript.currentLineIndex);
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
.subs-drop.drop.over {
  border: 2px dashed #ccc;
}

.youtube-video-wrapper {
  max-width: calc((100vh - 10rem) * 16 / 9);
  margin: 0 auto;
  position: sticky;
  top: 2.9rem;
}

.zerotohero-wide {
  .youtube-video-wrapper {
    top: 0;
  }
}

.youtube-video-column {
  position: sticky;
  top: 0;
  z-index: 2;
}

#zerotohero:not(.zerotohero-wide) {
  .youtube-video-column {
    top: 2.9rem;
  }
}

.youtube-video-info {
  padding-left: 0.667rem;
  padding-right: 0.667rem;
}

.youtube-with-transcript-landscape {
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