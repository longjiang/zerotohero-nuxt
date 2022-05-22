
<template>
  <div>
    <SocialHead
      :title="`${video ? video.title + ' | ' : ''}Learn ${
        $l2.name
      } with a video | zerotohero.ca`"
      :description="`Study the transcript of this video with a popup dictionary`"
      :image="`https://img.youtube.com/vi/${this.youtube_id}/hqdefault.jpg`"
    />
    <div
      :class="`toggle-wrapper ${layout !== 'mini' ? 'maximized' : 'minimized'}`"
    >
      <router-link
        :class="`btn btn-unstyled ${
          layout !== 'mini' ? 'btn-maximize-toggle' : 'btn-minimize-toggle'
        }`"
        :to="minimizeToggleRouterLinkTo"
      >
        <i class="fas fa-chevron-down" v-if="layout !== 'mini'"></i>
        <i class="fas fa-chevron-up" v-if="layout === 'mini'"></i>
      </router-link>
      <b-button variant="unstyled" class="btn-close" @click="close">
        <i class="fa fa-times"></i>
      </b-button>
    </div>
    <div
      :class="{
        'youtube-view pb-5 ': true,
        'main-dark main-dark-performant': true,
        'youtube-view-wrapper': true,
        'youtube-view-landscape': landscape,
        fullscreen: layout === 'vertical',
      }"
    >
      <div
        :class="{ 'loader text-center': true, 'd-none': video }"
        style="padding-top: 30vh; padding-bottom: 30vh"
      >
        <Loader :sticky="true" message="Preparing video and transcript..." />
      </div>

      <LazyYouTubeWithTranscript
        v-if="video"
        ref="youtube"
        skin="dark"
        :video="video"
        :key="`transcript-${video.youtube_id}`"
        :autoload="true"
        :autoplay="false"
        :starttime="starttime"
        :show="show"
        :showType="showType"
        :episodes="episodes"
        :forcePortrait="false"
        :startLineIndex="startLineIndex"
        :layout="layout"
        @ended="updateEnded"
        @currentTime="updateCurrentTimeQueryString"
        @updateLayout="onYouTubeUpdateLayout"
        @videoUnavailable="onVideoUnavailable"
      />
    </div>
  </div>
</template>

<script>
import YouTube from "@/lib/youtube";
import Helper from "@/lib/helper";
import DateHelper from "@/lib/date-helper";
import Config from "@/lib/config";
import axios from "axios";
import Vue from "vue";

export default {
  props: {
    youtube_id: {
      type: String,
      required: true,
    },
    lesson: {
      type: String, // If the video is a "lesson video" (with lesson vocab highlighted), set this to "lesson"
      required: false,
    },
    mini: {
      type: Boolean,
      default: false,
      required: false,
    },
    fullHistory: {
      type: Array,
    },
  },
  data() {
    return {
      currentTime: 0,
      episodes: [],
      extrasLoaded: false,
      fetchDone: false,
      initialLayout: "horizontal",
      mountedDone: false,
      randomEpisodeYouTubeId: undefined,
      show: undefined,
      showType: undefined,
      startLineIndex: 0,
      starttime: 0,
      video: undefined,
    };
  },
  computed: {
    landscape() {
      if (this.forcePortrait) return false;
      if (process.browser && this.viewportWidth && this.viewportHeight) {
        let landscape = this.viewportWidth > this.viewportHeight;
        return landscape;
      }
    },
    /**
     * The router link that we send the user to when they close the player.
     */
    maximizeVideoTo() {
      return {
        name: "youtube-view",
        params: { youtube_id: this.youtube_id, lesson: this.lesson },
      };
    },
    minimizeVideoTo() {
      if (this.fullHistory) {
        let lastNonYouTubeViewPath = this.fullHistory.find(
          (h) =>
            !h.includes("youtube/view") &&
            h.includes(this.$l1.code + "/" + this.$l2.code) // Must be the same language!
        );
        if (lastNonYouTubeViewPath) return lastNonYouTubeViewPath;
        else return { name: "all-media" };
      }
      return { name: "all-media" };
    },
    minimizeToggleRouterLinkTo() {
      return this.mini ? this.maximizeVideoTo : this.minimizeVideoTo;
    },
    layout() {
      return this.mini ? "mini" : this.initialLayout;
    },
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
    currentTimeInSeconds() {
      let t = Math.floor(this.currentTime / 10) * 10;
      return t;
    },
  },
  validate({ params, query, store }) {
    if (params.youtube_id && params.youtube_id.length > 1) return true;
    return false;
  },
  async fetch() {
    try {
      console.log(`YouTube View (Fetch): Getting saved video...`);
      let savedVideo, videoFromApi;
      savedVideo = await this.getSaved();
      if (this.lesson && savedVideo.level && savedVideo.lesson) {
        this.saveWords(savedVideo.level, savedVideo.lesson);
      }
      if (!savedVideo || (!savedVideo.channel && this.$adminMode)) {
        console.log(
          `YouTube View (Fetch): Getting channel information with youtube api...`
        );
        videoFromApi = await YouTube.videoByApi(this.youtube_id);
      }
      this.video = this.mergeVideos(savedVideo, videoFromApi);
    } catch (e) {
      console.log(e);
    }
  },
  destroyed() {
    this.unbindKeys();
  },
  watch: {
    /**
     * Called when the video is first fetched
     */
    async video() {
      console.log(
        "YouTube View: 📼 Video changed, getting subs and other info..."
      );
      if (!this.extrasLoaded && typeof this.video !== "undefined") {
        this.extrasLoaded = true;
        console.log(`YouTube View (on video change): load subs if missing...`);
        this.video = await this.loadSubsIfMissing(this.video);
        if (!Helper.wide()) {
          let el = this.$refs["youtube"];
          if (el) Helper.scrollToTargetAdjusted(el.$el, 43);
        }
        if (this.video && this.video.subs_l2 && this.video.subs_l2[0]) {
          if (!this.video.subs_l2[0].duration)
            this.video = await this.patchDuration(this.video);
          else
            console.log(
              "YouTube View: Video subs have duration! 🎉 First line duration is ",
              this.video.subs_l2[0].duration
            );
        }
        this.setShow();
        this.saveHistory();
        this.bindKeys();
        this.unsubscribe = this.$store.subscribe((mutation, state) => {
          if (mutation.type === "shows/LOAD_SHOWS") {
            this.setShow();
          }
        });
        console.log(`YouTube View: All done.`);
      }
    },
    /**
     * Called when the show is loaded from this.setShows() after the shows.js store retrieves TV shows
     */
    async show() {
      console.log("YouTube View: 📀 Show changed, getting episodes...");
      if (this.show) {
        // News and YouTube channels are sorted by date
        // Audiobooks and TV Shows are sorted by title
        let sort = "-date";
        if (this.showType === "tv_show" || this.show.audiobook) sort = "title";
        let response = await axios.get(
          `${Config.youtubeVideosTableName(this.$l2.id)}?filter[l2][eq]=${
            this.$l2.id
          }&filter[${this.showType}][eq]=${
            this.show.id
          }&sort=${sort}&fields=youtube_id&timestamp=${
            this.$adminMode ? Date.now() : 0
          }&limit=100`
        );
        if (response.data && response.data.data) {
          let videos = response.data.data;
          videos = Helper.uniqueByValue(videos, "youtube_id");
          this.episodes = videos;
        }
      }
    },
  },
  methods: {
    close() {
      if (this.layout !== "mini") this.$router.push(this.minimizeVideoTo);
      this.$emit("close");
    },
    onYouTubeUpdateLayout(layout) {
      this.initialLayout = initialLayout;
    },
    async onVideoUnavailable(youtube_id) {
      try {
        await YouTube.reportUnavailableVideo({
          youtube_id,
          video_id: this.video.id,
          l2Id: this.$l2.id,
        });
        // Go to next video
        if (this.nextEpisode) this.$router.push(this.nextEpisode);
      } catch (err) {
        console.log(err);
      }
    },
    mergeVideos(video, youtube_video) {
      let merged = {};
      video = video || {};
      youtube_video = youtube_video || {};
      for (var attrname in video) {
        merged[attrname] = video[attrname] || youtube_video[attrname];
      }
      for (var attrname in youtube_video) {
        merged[attrname] = video[attrname] || youtube_video[attrname];
      }
      return merged;
    },
    async checkSubsAndAddLocalesIfNeeded(video) {
      try {
        let missingSubsL1 = !video.subs_l1 || video.subs_l1.length === 0;
        let missingSubsL2 = !video.subs_l2 || video.subs_l2.length === 0;
        if (missingSubsL1 || missingSubsL2) {
          console.log(`YouTube View: Getting available transcripts...`);
          video = await YouTube.getYouTubeSubsListAndAddLocale(
            video,
            this.$l1,
            this.$l2
          );
        } else {
          Vue.set(video, "checkingSubs", false);
        }
        return video;
      } catch (err) {
        console.log(err);
      }
    },
    async getTranscript(video) {
      console.log(`YouTube View: Getting ${this.$l2.name} transcript`);
      Vue.set(video, "checkingSubs", true);
      console.log();
      let subs_l2 = await YouTube.getTranscript(
        video.youtube_id,
        video.l2Locale,
        video.l2Name,
        this.$adminMode
      );
      if (subs_l2 && subs_l2.length > 0) Vue.set(video, "subs_l2", subs_l2);
      Vue.set(video, "checkingSubs", false);
      return video;
    },
    async loadSubsIfMissing(video) {
      try {
        video = await this.checkSubsAndAddLocalesIfNeeded(video);
        if (!video.subs_l2 || video.subs_l2.length === 0) {
          video = await this.getTranscript(video);
        }
        if (video.subs_l2 && video.subs_l2.length > 0) {
          this.firstLineTime = video.subs_l2[0].starttime;
        }
        this.starttime = this.$route.query.t ? Number(this.$route.query.t) : 0;
        if (video.subs_l2) {
          let startLineIndex = video.subs_l2.findIndex(
            (l) => Number(l.starttime) >= this.starttime
          );
          this.startLineIndex = startLineIndex || 0;
        }
        return video;
      } catch (err) {
        console.log(err);
      }
      return video;
    },
    async getSaved() {
      let response;
      try {
        response = await axios.get(
          `${Config.youtubeVideosTableName(
            this.$l2.id
          )}?filter[youtube_id][eq]=${this.youtube_id}&filter[l2][eq]=${
            this.$l2.id
          }&fields=channel_id,id,l2,lesson,level,notes,subs_l1,subs_l2,title,topic,youtube_id,tv_show.*,talk.*&timestamp=${
            this.$adminMode ? Date.now() : 0
          }`
        );
      } catch (err) {
        console.log(err);
        return;
      }
      if (
        response &&
        response.data &&
        response.data.data &&
        response.data.data.length > 0
      ) {
        let video = response.data.data[0];
        for (let field of ["subs_l2", "subs_l1"]) {
          if (video[field] && typeof video[field] === "string") {
            let savedSubs = YouTube.parseSavedSubs(video[field]);
            if (savedSubs) {
              let filtered = savedSubs.filter(
                (line) =>
                  line && typeof line.starttime !== "undefined" && line.line
              );
              video[field] = filtered;
            }
          }
        }
        if (video.notes) video.notes = YouTube.parseNotes(video.notes);
        if (!video.channel && video.channel_id) {
          video.channel = {
            id: video.channel_id,
          };
        }
        video.checkingSubs = false;
        return video;
      }
    },
    setShow() {
      console.log("YouTube View: Setting show...");
      if (this.video) {
        if (this.video.tv_show) {
          this.show = this.video.tv_show;
          this.showType = "tv_show";
        } else if (this.video.talk) {
          this.show = this.video.talk;
          this.showType = "talk";
        }
      }
    },
    updateCurrentTimeQueryString(currentTime) {
      if (typeof window !== "undefined") {
        this.currentTime = currentTime;
        const params = new URLSearchParams(window.location.search);
        const qt = params.get("t") ? Number(params.get("t")) : 0;
        if (this.currentTimeInSeconds !== qt) {
          window.history.replaceState(
            "",
            "",
            `?t=${this.currentTimeInSeconds}`
          );
          this.saveHistory();
        }
      }
    },
    async updateEnded(ended) {
      if (ended !== this.ended) {
        this.ended = ended;
      }
      if (this.ended) {
        await Helper.timeout(5000);
        if (
          this.ended &&
          this.$refs.youtube &&
          !this.$refs.youtube.showSubsEditing &&
          !this.$refs.youtube.enableTranslationEditing
        ) {
          if (this.nextEpisode) this.$router.push(this.nextEpisode);
        }
      }
    },
    wordSaved(word) {
      let saved = false;
      if (word) {
        saved = this.$store.getters["savedWords/has"]({
          id: word.id,
          l2: this.$l2.code,
        });
      }
      return saved;
    },
    async allForms(word) {
      let wordForms =
        (await (await this.$getDictionary()).wordForms(word)) || [];
      wordForms = wordForms.filter((form) => form !== "");
      wordForms = [word.head.toLowerCase()].concat(
        wordForms.map((form) => form.form.replace(/'/g, ""))
      );
      wordForms = Helper.unique(wordForms).filter(
        (form) => form && form !== "" && form !== "-"
      );
      return wordForms;
    },
    async saveWords(level, lesson) {
      let dictionary = await this.$getDictionary();
      if (typeof dictionary !== "undefined") {
        let words = await dictionary.lookupByLesson(level, lesson);
        for (let word of words) {
          if (word && !this.wordSaved(word)) {
            let wordForms = await this.allForms(word);
            this.$store.dispatch("savedWords/add", {
              word: word,
              wordForms: wordForms,
              l2: this.$l2.code,
            });
          }
        }
      }
    },
    async patchChannelID(video, channelId) {
      let response = await axios.patch(
        `${Config.youtubeVideosTableName(this.$l2.id)}/${
          video.id
        }?fields=id,channel_id`,
        { channel_id: channelId }
      );
      if (response && response.data) {
        video.channel_id = response.data;
      }
    },
    async patchDuration(video) {
      console.log(
        "YouTube View: Saved subtitles does not have duration, getting duration..."
      );
      video = await this.checkSubsAndAddLocalesIfNeeded(video);
      video = await this.getTranscript(video);
      if (video.subs_l2 && video.subs_l2[0] && video.subs_l2[0].duration) {
        let subs_l2 = YouTube.unparseSubs(video.subs_l2);
        try {
          await axios.patch(
            `${Config.youtubeVideosTableName(this.$l2.id)}/${
              video.id
            }?fields=id`,
            { subs_l2 }
          );
          console.log("Missing duration information added.");
        } catch (err) {
          console.log(err);
        }
      }
      return video;
    },
    scrollToComments() {
      document.getElementById("comments").scrollIntoView();
    },
    bindKeys() {
      window.onkeydown = (e) => {
        if (
          e.target.tagName.toUpperCase() !== "INPUT" &&
          !e.metaKey &&
          !e.target.getAttribute("contenteditable")
        ) {
          if (e.code === "KeyM") {
            if (this.$refs.youtube && this.$refs.youtube.$refs.videoControls)
              this.$refs.youtube.$refs.videoControls.toggleSpeed();
            return false;
          }
          if (e.code === "Space") {
            this.$refs.youtube ? this.$refs.youtube.togglePaused() : "";
            return false;
          }
          if (["ArrowUp", "ArrowLeft"].includes(e.code)) {
            this.$refs.youtube.$refs.transcript.goToPreviousLine();
            return false;
          }
          if (["ArrowDown", "ArrowRight"].includes(e.code)) {
            this.$refs.youtube.$refs.transcript.goToNextLine();
            return false;
          }
          if (["KeyR"].includes(e.code)) {
            this.$refs.youtube.$refs.transcript.rewind();
            return false;
          }
        }
      };
    },
    saveHistory() {
      console.log(`YouTube View: Saving history...`);
      if (typeof this.video === "undefined") return;
      let data = {
        type: "video",
        id: `${this.$l2.code}-video-${this.video.youtube_id}`,
        date: DateHelper.unparseDate(new Date()),
        l1: this.$l1.code,
        l2: this.$l2.code,
        video: {
          id: this.video.id,
          title: this.video.title,
          youtube_id: this.video.youtube_id,
          starttime: this.currentTimeInSeconds,
        },
      };
      if (this.$refs.youtube && this.$refs.youtube.duration) {
        data.video.duration = this.$refs.youtube.duration;
        data.video.progress = data.video.starttime / data.video.duration;
      }
      this.$store.dispatch("history/add", data);
    },
    unbindKeys() {
      window.onkeydown = null;
    },
  },
  activated() {
    this.bindKeys();
  },
  deactivated() {
    this.unbindKeys();
  },
};
</script>
<style lang="scss" scoped >
.toggle-wrapper {
  color: white;
  height: 5rem;
  display: flex;
  align-items: center;
  z-index: 9;
  position: fixed;
  right: 1rem;
  &.maximized {
    top: 0;
  }
  &.minimized {
  }
  .btn {
    color: white;
    text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
  }
  .btn-maximize-toggle {
  }
  .btn-minimize-toggle {
  }
  .btn-close {
  }
}

.zerotohero-not-wide {
  .toggle-wrapper.maximized {
    top: calc(env(safe-area-inset-top) + 2.5rem);
  }
}

.zerotohero-wide {
  .youtube-view-wrapper {
    ::v-deep .youtube-with-transcript-landscape {
      .youtube {
        border-radius: 0.3rem 0.3rem 0 0;
        overflow: hidden;

        .video-area {
          background: black;
        }
      }

      .quick-access-buttons {
        border-radius: 0 0 0.3rem 0.3rem;
      }
    }
  }
}

.youtube-view-wrapper {
  &.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: black;
    color: #ffffffaa;
    z-index: 9;
  }
}
</style>
