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
            @duration="updateDuration"
            :speed="speed"
            :youtube="video.youtube_id"
            :starttime="start"
            :autoload="autoload"
            :autoplay="autoplay"
            :class="{ 'd-none': collapsed }"
          />
          <VideoControls
            v-if="video"
            :video="video"
            :paused="paused"
            :layout="layout"
            :showFullscreenToggle="showFullscreenToggle"
            :showLineList="showLineList"
            ref="videoControls"
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
            <span v-if="video" :key="`video-title-${video.title}`" class="mt-4">
              <Annotate :phonetics="false" :buttons="true">
                <span>{{ video.title }}</span>
              </Annotate>
            </span>
            <a
              :class="{
                'btn btn-small ml-2 mb-1': true,
                'btn-ghost-dark': skin === 'dark',
              }"
              :href="`https://www.google.com/search?q=${encodeURIComponent(
                video.title
              )}`"
              target="google"
            >
              <i class="fas fa-info-circle"></i>
            </a>
          </h3>
          <div style="color: #aaa" class="mb-2">
            <span v-if="video.date">{{ formatDate(video.date) }}</span>
            <span v-if="episodes.length">
              · Video {{ episodeIndex + 1 }} of {{ episodes.length }}
            </span>
          </div>
          <div
            :key="`youtube-video-info-${video.youtube_id}-${videoInfoKey}`"
            :class="{ 'd-none': !video.id }"
          >
            <router-link
              v-if="previousEpisode"
              :to="previousEpisode"
              :class="{
                'btn btn-small': true,
                'btn-primary': skin === 'light',
                'btn-ghost-dark': skin === 'dark',
              }"
            >
              <i class="fa fa-chevron-left"></i>
              Previous
            </router-link>
            <router-link
              v-if="show"
              :to="`/${$l1.code}/${$l2.code}/show/${
                showType === 'tv_show' ? 'tv-show' : 'talk'
              }/${show.id}`"
              :class="{
                'btn btn-small': true,
                'btn-primary': skin === 'light',
                'btn-ghost-dark': skin === 'dark',
              }"
            >
              <i class="fa fa-tv mr-1" v-if="show.title !== 'Music'"></i>
              <i class="fas fa-music mr-1" v-if="show.title === 'Music'"></i>
              <i class="fas fa-film mr-1" v-if="show.title === 'Movies'"></i>
              <i class="fas fa-news mr-1" v-if="show.title === 'News'"></i>
              All
              {{
                ["Music", "News", "Movies"].includes(show.title)
                  ? show.title
                  : "Episodes"
              }}
            </router-link>
            <router-link
              v-if="nextEpisode"
              :to="nextEpisode"
              :class="{
                'btn btn-small': true,
                'btn-primary': skin === 'light',
                'btn-ghost-dark': skin === 'dark',
              }"
            >
              Next
              <i class="fa fa-chevron-right"></i>
            </router-link>
            <router-link
              v-if="episodes.length > 0"
              :to="`/${this.$l1.code}/${this.$l2.code}/youtube/view/${this.randomEpisodeYouTubeId}`"
              :class="{
                'btn btn-small': true,
                'bg-secondary': skin === 'light',
                'btn-ghost-dark': skin === 'dark',
              }"
            >
              <i class="fa fa-random"></i>
              Random
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
          <div
            class="p-4 mt-4 rounded"
            style="
              border: 2px dashed rgba(136, 136, 136, 0.5);
              color: rgba(136, 136, 136, 0.85);
            "
            v-if="!video.subs_l2"
          >
            <h6>
              This video does not have closed captions (CC) in {{ $l2.name }}.
            </h6>
            <div class="mt-3">
              Otherwise, video trancript will show up here.
            </div>
          </div>
        </div>
        <div class="mt-3">
          <SyncedTranscript
            v-if="video.subs_l2 && video.subs_l2.length > 0"
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
          <div class="mt-5 youtube-video-info youtube-video-info-bottom">
            <div class="youtube-view-bottom-navigation text-center">
              <router-link
                v-if="previousEpisode"
                :to="previousEpisode"
                :class="{
                  btn: true,
                  'btn-primary': skin === 'light',
                  'btn-ghost-dark': skin === 'dark',
                }"
              >
                <i class="fa fa-chevron-left"></i>
                Previous
              </router-link>
              <router-link
                v-if="show"
                :to="`/${$l1.code}/${$l2.code}/show/${
                  showType === 'tv_show' ? 'tv-show' : 'talk'
                }/${show.id}`"
                :class="{
                  btn: true,
                  'btn-primary': skin === 'light',
                  'btn-ghost-dark': skin === 'dark',
                }"
              >
                <i class="fa fa-tv mr-1" v-if="show.title !== 'Music'"></i>
                <i class="fas fa-music mr-1" v-if="show.title === 'Music'"></i>
                <i class="fas fa-film mr-1" v-if="show.title === 'Movies'"></i>
                <i class="fas fa-news mr-1" v-if="show.title === 'News'"></i>
                All
                {{
                  ["Music", "News", "Movies"].includes(show.title)
                    ? show.title
                    : "Episodes"
                }}
              </router-link>
              <router-link
                v-if="nextEpisode"
                :to="nextEpisode"
                :class="{
                  btn: true,
                  'btn-primary': skin === 'light',
                  'btn-ghost-dark': skin === 'dark',
                }"
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
            />
            <VideoControls
              v-if="video"
              :video="video"
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
        <div :key="'transcript-' + video.youtube_id" class="mt-2 col-sm-12">
          <div class="text-center">
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
      </div>
    </template>
  </div>
</template>

<script>
import Vue from "vue";
import DateHelper from "@/lib/date-helper";
import Helper from "@/lib/helper";

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
    stopLineIndex: {
      default: -1,
    },
    showFullscreenToggle: {
      default: true,
    },
    showLineList: {
      default: true,
    },
    skin: {
      default: "light",
    },
    forcePortrait: {
      default: false,
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
    randomEpisodeYouTubeId() {
      let episode = Helper.randomArrayItem(this.episodes);
      return episode.youtube_id;
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
    formatDate(date) {
      return DateHelper.formatDate(date);
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

<style lang="scss" scoped>
.subs-drop.drop.over {
  border: 2px dashed #ccc;
}
.youtube-video-wrapper {
  max-width: calc((100vh - 10rem) * 16 / 9);
  margin: 0 auto;
  position: sticky;
  top: 0;
}
.youtube-video-column {
  position: sticky;
  top: 0;
  z-index: 9;
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
  padding-left: 2.5rem;
  padding-right: 1.5rem;
}
</style>