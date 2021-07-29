<template>
  <div class="container-fluid youtube-with-transcript">
    <div v-if="layout === 'horizontal'" class="row">
      <div
        :class="{
          'youtube-video-column col-sm-12 mb-4 p-0': true,
          'order-2': landscape && $l2.direction === 'rtl',
        }"
      >
        <div class="youtube-video-wrapper" :key="'youtube-' + video.youtube_id">
          <YouTubeVideo
            ref="youtube"
            @paused="updatePaused"
            @currentTime="updateCurrentTime"
            @ended="updateEnded"
            :speed="speed"
            :youtube="video.youtube_id"
            :starttime="start"
            :autoload="autoload"
            :autoplay="autoplay"
          />
          <VideoControls
            v-if="video"
            :video="video"
            :paused="paused"
            :layout="layout"
            :showFullscreenToggle="showFullscreenToggle"
            :showLineList="showLineList"
            ref="videoControls"
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
      <div class="youtube-transcript-column col-sm-12">
        <div class="youtube-video-info">
          <h5 style="line-height: 1.5">
            <span v-if="video" :key="`video-title-${video.title}`" class="mt-4">
              <Annotate :phonetics="false" :buttons="true">
                <span>{{ video.title }}</span>
              </Annotate>
            </span>
            <a class="btn-small" :href="`https://www.google.com/search?q=${encodeURIComponent(video.title)}`" target="google">
              <i class="fas fa-info-circle"></i>
            </a>
          </h5>
          <div style="color: #aaa" v-if="video.date" class="mb-2">
            {{ formatDate(video.date) }}
          </div>
          <div
            :key="`youtube-video-info-${video.youtube_id}-${videoInfoKey}`"
            :class="{ 'd-none': !video.id }"
          >
            <router-link
              v-if="previousEpisode"
              :to="previousEpisode"
              class="btn btn-small btn-primary"
            >
              <i class="fa fa-chevron-left"></i>
              Previous
            </router-link>
            <router-link
              v-if="show"
              :to="`/${$l1.code}/${$l2.code}/show/${
                showType === 'tv_show' ? 'tv-show' : 'talk'
              }/${show.id}`"
              class="btn btn-small btn-primary"
            >
              <i class="far fa-clone"></i>
              All Episodes
            </router-link>
            <router-link
              v-if="nextEpisode"
              :to="nextEpisode"
              class="btn btn-small btn-primary"
            >
              Next
              <i class="fa fa-chevron-right"></i>
            </router-link>
          </div>
          <VideoAdmin
            :class="{ 'd-none': !$adminMode }"
            :video="video"
            ref="videoAdmin1"
            @showSubsEditing="toggleShowSubsEditing"
            @updateTranslation="updateTranslation"
            @updateOriginalText="updateOriginalText"
            @enableTranslationEditing="toggleEnableTranslationEditing"
          />
          <hr v-if="video.channel" />
          <YouTubeChannelCard
            v-if="video.channel"
            :channel="video.channel"
            :key="`channel-${video.channel.id}`"
            class="d-inline-block"
          />
        </div>
        <div v-if="video.subs_l2 && video.subs_l2.length > 0" class="mt-3">
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
            @seek="seekYouTube"
            @pause="pause"
            @play="play"
            @speechStart="speechStart"
            @speechEnd="speechEnd"
            @updateTranslation="updateTranslation"
          />
          <div class="text-center mt-5">
            <router-link
              v-if="previousEpisode"
              :to="previousEpisode"
              class="btn btn-primary"
            >
              <i class="fa fa-chevron-left"></i>
              Previous
            </router-link>
            <router-link
              v-if="show"
              :to="`/${$l1.code}/${$l2.code}/show/${
                showType === 'tv_show' ? 'tv-show' : 'talk'
              }/${show.id}`"
              class="btn btn-primary"
            >
              <i class="far fa-clone"></i>
              All Episodes
            </router-link>
            <router-link
              v-if="nextEpisode"
              :to="nextEpisode"
              class="btn btn-primary"
            >
              Next
              <i class="fa fa-chevron-right"></i>
            </router-link>
          </div>
          <VideoAdmin
            :class="{ 'mt-5': true, 'd-none': !$adminMode }"
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
    <template v-if="layout === 'vertical'">
      <div class="row video-area">
        <div style="width: 100%">
          <div class="youtube-video-wrapper">
            <YouTubeVideo
              ref="youtube"
              @paused="updatePaused"
              @currentTime="updateCurrentTime"
              @ended="updateEnded"
              :speed="speed"
              :youtube="video.youtube_id"
              :starttime="start"
              :autoload="autoload"
              :autoplay="autoplay"
            />
            <VideoControls
              v-if="video"
              :video="video"
              :paused="paused"
              :layout="layout"
              :showFullscreenToggle="showFullscreenToggle"
              :showLineList="showLineList"
              ref="videoControls"
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
      <div class="row">
        <div :key="'transcript-' + video.youtube_id" class="mt-2 col-sm-12">
          <div
            v-if="video.subs_l2 && video.subs_l2.length > 0"
            class="text-center"
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
              @seek="seekYouTube"
              @pause="pause"
              @play="play"
              @speechStart="speechStart"
              @speechEnd="speechEnd"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import moment from "moment";
import Vue from "vue";

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
    stopLineIndex: {
      default: -1,
    },
    showFullscreenToggle: {
      default: true,
    },
    showLineList: {
      default: true,
    },
  },
  data() {
    return {
      speaking: false,
      transcriptKey: 0,
      paused: true,
      repeatMode: false,
      audioMode: false,
      showSubsEditing: false,
      enableTranslationEditing: false,
      currentTime: 0,
      videoInfoKey: 0,
      speed: 1,
      layout: this.initialLayout,
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
        this.startLineIndex
          ? this.video.subs_l2[this.startLineIndex].starttime
          : this.starttime;
      return starttime;
    },
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
    landscape() {
      let landscape =
        typeof window !== "undefined" && window.innerWidth > window.innerHeight;
      return landscape;
    },
  },
  updated() {
    if (this.$refs.transcript) {
      this.$refs.transcript.repeatMode = this.repeatMode;
      this.$refs.transcript.audioMode = this.audioMode;
    }
    if (this.$refs.youtube) this.$refs.youtube.speed = this.speed;
  },
  methods: {
    updateTranslation(translation) {
      let translationLines = translation.split("\n").filter((t) => t !== "");
      if (translationLines.length > 0 && this.video.subs_l2) {
        let subs_l1 = this.video.subs_l2.map((line, lineIndex) => {
          if (translationLines[lineIndex])
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
      if (
        textLines.length > 0 &&
        (!this.video.subs_l2 || this.video.subs_l2.length === 0)
      ) {
        let duration = this.$refs.youtube.getDuration();
        let increment = duration / textLines.length;
        let subs_l2 = textLines.map((line, lineIndex) => {
          return {
            starttime: increment * lineIndex,
            line,
          };
        });
        Vue.set(this.video, "subs_l2", subs_l2);
      }
    },
    toggleShowSubsEditing(showSubsEditing) {
      this.showSubsEditing = showSubsEditing;
      if (this.$refs.videoAdmin1) this.$refs.videoAdmin1.showSubsEditing = showSubsEditing;
      if (this.$refs.videoAdmin2) this.$refs.videoAdmin2.showSubsEditing = showSubsEditing;
    },
    toggleEnableTranslationEditing(enableTranslationEditing) {
      this.enableTranslationEditing = enableTranslationEditing;
      if (this.$refs.videoAdmin1) this.$refs.videoAdmin1.enableTranslationEditing = enableTranslationEditing;
      if (this.$refs.videoAdmin2) this.$refs.videoAdmin2.enableTranslationEditing = enableTranslationEditing;
    },
    formatDate(date) {
      return moment(date).format("LL");
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
      if (this.currentTime !== currentTime) {
        this.currentTime = currentTime;
        this.$emit("currentTime", this.currentTime);
      }
      if (this.$refs.transcript)
        this.$refs.transcript.currentTime = currentTime;
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
      } else this.$refs.transcript.rewind();
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
  watch: {
    startLineIndex() {
      if (this.$refs.youtube.player && this.$refs.youtube.player.seekTo) {
        this.rewind();
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
  },
};
</script>

<style scoped>
.subs-drop.drop.over {
  border: 2px dashed #ccc;
}
.youtube-video-wrapper {
  max-width: calc((100vh - 10rem) * 16 / 9);
  margin: 0 auto;
  position: sticky;
  top: 0;
  background: white;
}
.youtube-video-column {
  background: white;
  position: sticky;
  top: 0;
  z-index: 9;
}

.youtube-video-info {
  padding-left: 0.667rem;
  padding-right: 0.667rem;
}

@media screen and (orientation: landscape) {
  .youtube-video-column,
  .youtube-transcript-column {
    flex: 1;
  }
}
</style>