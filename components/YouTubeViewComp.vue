
<template>
  <div class="youtube-view" style="transition: all 0.5s ease-in-out">
    <SocialHead
      :title="`${video ? video.title + ' | ' : ''}Learn ${
        $l2.name
      } with a video | zerotohero.ca`"
      :description="`Study the transcript of this video with a popup dictionary`"
      :image="`https://img.youtube.com/vi/${this.youtube_id}/hqdefault.jpg`"
    />
    <div
      :class="`toggle-wrapper ${layout !== 'mini' ? 'maximized' : 'minimized'}`"
      v-if="layout === 'mini'"
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
        'pb-5': true,
        'main-dark main-dark-performant': true,
        'youtube-view-content': true,
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
        :startLineIndex="startLineIndex"
        :show="show"
        :showType="showType"
        :episodes="episodes"
        :forcePortrait="false"
        :initialLayout="layout"
        :largeEpisodeCount="largeEpisodeCount"
        @ended="updateEnded"
        @previous="goToPreviousEpisode"
        @next="goToNextEpisode"
        @currentTime="updateCurrentTimeQueryString"
        @updateLayout="onYouTubeUpdateLayout"
      />
    </div>
  </div>
</template>

<script>
import YouTube from "@/lib/youtube";
import Helper from "@/lib/helper";
import DateHelper from "@/lib/date-helper";
import Vue from "vue";
import { mapState } from "vuex";

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
    starttime: {
      type: Number,
      default: 0,
    },
    mini: {
      type: Boolean,
      default: false,
      required: false,
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
      video: undefined,
      largeEpisodeCount: undefined,
    };
  },
  computed: {
    ...mapState("stats", ["stats"]),
    ...mapState("fullHistory", ["fullHistory"]),
    fullHistoryPathsByL1L2() {
      return this.$store.getters["fullHistory/fullHistoryPathsByL1L2"]({
        l1: this.$l1,
        l2: this.$l2,
      });
    },
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
      if (this.fullHistoryPathsByL1L2) {
        let fullHistoryReversed = [...this.fullHistoryPathsByL1L2].reverse();
        let lastNonYouTubeViewPath = fullHistoryReversed.find(
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
    episodeIndex() {
      return this.episodes.findIndex(
        (e) => e.youtube_id === this.video.youtube_id
      );
    },
    previousEpisode() {
      if (this.episodes && this.episodeIndex > -1) {
        return this.episodes[this.episodeIndex - 1];
      }
    },
    nextEpisode() {
      if (this.episodes && this.episodeIndex > -1) {
        return this.episodes[this.episodeIndex + 1];
      }
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
      if (!savedVideo || (!savedVideo.channel && this.$adminMode)) {
        console.log(
          `YouTube View (Fetch): Getting channel information with youtube api...`
        );
        videoFromApi = await YouTube.videoByApi(this.youtube_id);
        if (!videoFromApi) videoFromApi = { youtube_id: this.youtube_id };
      }
      this.video = this.mergeVideos(savedVideo, videoFromApi);
    } catch (e) {
      console.log(e);
    }
  },
  destroyed() {
    this.unbindKeys();
  },
  beforeDestroy() {
    if (this.unsubscribe) this.unsubscribe();
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
        let video = await this.loadSubsIfMissing(this.video);
        if (this.layout !== "mini" && !Helper.wide()) {
          let el = this.$refs["youtube"];
          if (el) Helper.scrollToTargetAdjusted(el.$el, 43);
        }
        if (video && video.subs_l2 && video.subs_l2[0]) {
          if (!video.subs_l2[0].duration)
            video = await this.patchDuration(video);
          else
            console.log(
              "YouTube View: Video subs have duration! 🎉 First line duration is ",
              video.subs_l2[0].duration
            );
        }
        this.video = video;
        this.saveHistory();
        this.bindKeys();
        if (this.$store.state.shows.showsLoaded[this.$l2.code]) {
          if (!this.show) this.setShow();
        }
        this.unsubscribe = this.$store.subscribe((mutation, state) => {
          if (mutation.type === "shows/LOAD_SHOWS") {
            if (!this.show) this.setShow();
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
        let limit = 100;
        let episodeCount = await this.getEpisodeCount();
        if (episodeCount > limit && this.$refs.youtube)
          this.largeEpisodeCount = episodeCount;
        this.episodes = await this.getEpisodes(episodeCount, limit);
      }
    },
  },
  methods: {
    async getEpisodes(episodeCount, limit) {
      // If we already have the episodes stored in the show (in Vuex), and the episodes include the current video, just return the episodes
      if (
        this.show.episodes &&
        this.show.episodes.find((s) => s.youtube_id === this.video.youtube_id)
      )
        return this.show.episodes;

      let videos = [];
      // News and YouTube channels are sorted by date
      // Audiobooks and TV Shows are sorted by title

      let sort =
        this.showType === "tv_show" || this.show.audiobook ? "title" : "-date";
      let fields = "youtube_id,title,date";
      let timestamp = this.$adminMode ? Date.now() : 0;
      let params = { limit, sort, fields, timestamp };
      params[`filter[${this.showType}][eq]`] = this.show.id;

      let postParams = Object.assign({}, params);

      // We assume that this is a LONG show with hundreds or even thousands of episodes (like News, Music, or some TV station show
      // Let's grab the videos immediately PRIOR and AFTER the current video, so the user can eventually paginate through all the episodes.
      // If sort is '-date', the user wants to see contents that are around the same date.
      // If sort is 'title', the user wants to see contents with similar alpha-sorted titles
      if (episodeCount > limit) {
        if (sort === "title") {
          postParams["filter[title][gt]"] = this.video.title;
        }
        if (sort === "-date") {
          postParams["filter[date][lt]"] = this.video.date;
        }
      }

      let moreVideos = await this.$directus.getVideos({
        l2Id: this.$l2.id,
        query: Helper.queryString(postParams),
      });
      if (moreVideos) {
        videos = [...videos, moreVideos];
      }

      // Make sure this video is included in the collection
      videos = [this.video, ...videos];
      videos = Helper.uniqueByValue(videos, "youtube_id");
      if (sort === "-date") {
        videos = videos.sort((a, b) =>
          b.date ? b.date.localeCompare(a.date) : 0
        );
      } else {
        videos = videos.sort((a, b) =>
          a.title ? a.title.localeCompare(b.title) : 0
        );
      }

      this.$store.dispatch("shows/addEpisodesToShow", {
        l2: this.$l2,
        collection: this.showType === "tv_show" ? "tvShows" : "talks",
        showId: this.show.id,
        episodes: videos,
        sort,
      });
      return videos;
    },
    async getEpisodeCount() {
      if (this.show.episodeCount) return this.show.episodeCount;
      let episodeCount = 0;
      if (this.stats && this.stats[this.$l2.code]) {
        // Music, Movies, News
        episodeCount =
          this.stats[this.$l2.code][this.show.title.toLowerCase()] || 0; // Most likely undefined
      }
      if (episodeCount < 1) {
        try {
          episodeCount = await this.$directus.countShowEpisodes(
            this.showType,
            this.show.id,
            this.$l2.id,
            this.$adminMode
          );
        } catch (err) {
          print(err);
        }
      }
      if (episodeCount)
        this.$store.dispatch("shows/setEpisodeCount", {
          l2: this.$l2,
          collection: this.showType === "tv_show" ? "tvShows" : "talks",
          showId: this.show.id,
          episodeCount,
        });
      return episodeCount;
    },
    goToPreviousEpisode() {
      if (this.previousEpisode)
        this.$router.push({
          name: "youtube-view",
          params: {
            youtube_id: this.previousEpisode.youtube_id,
            lesson: this.previousEpisode.lesson,
          },
        });
    },
    goToNextEpisode() {
      if (this.nextEpisode)
        this.$router.push({
          name: "youtube-view",
          params: {
            youtube_id: this.nextEpisode.youtube_id,
            lesson: this.nextEpisode.lesson,
          },
        });
    },
    close() {
      if (this.layout !== "mini") this.$router.push(this.minimizeVideoTo);
      this.$emit("close", this.youtube_id);
    },
    onYouTubeUpdateLayout(layout) {
      this.initialLayout = layout;
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
        Helper.logError(err);
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
        if (video.subs_l2) {
          let startLineIndex = video.subs_l2.findIndex(
            (l) => Number(l.starttime) >= this.starttime
          );
          this.startLineIndex = startLineIndex || 0;
        }
        return video;
      } catch (err) {
        Helper.logError(err);
      }
      return video;
    },
    async getSaved() {
      let query = `filter[youtube_id][eq]=${
        this.youtube_id
      }&fields=*,tv_show.*,talk.*&timestamp=${
        this.$adminMode ? Date.now() : 0
      }`;
      let videos = await this.$directus.getVideos({ l2Id: this.$l2.id, query });
      if (videos?.length > 0) {
        let video = videos[0];
        for (let field of ["subs_l2", "subs_l1"]) {
          if (video[field] && typeof video[field] === "string") {
            let savedSubs = this.$subs.parseSavedSubs(video[field]);
            if (savedSubs) {
              let filtered = savedSubs.filter(
                (line) =>
                  line && typeof line.starttime !== "undefined" && line.line
              );
              video[field] = filtered;
            }
          }
        }
        if (video.notes) video.notes = this.$subs.parseNotes(video.notes);
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
          this.show = this.$store.getters["shows/tvShow"]({
            id: this.video.tv_show.id,
            l2: this.$l2,
          });
          this.showType = "tv_show";
        } else if (this.video.talk) {
          this.show = this.$store.getters["shows/talk"]({
            id: this.video.talk.id,
            l2: this.$l2,
          });
          this.showType = "talk";
        }
      }
    },
    updateCurrentTimeQueryString(currentTime) {
      if (typeof window !== "undefined") {
        this.currentTime = currentTime;
        const params = new URLSearchParams(window.location.search);
        const queryStringTime = params.get("t") ? Number(params.get("t")) : 0;
        if (this.currentTimeInSeconds !== queryStringTime) {
          window.history.replaceState(
            "",
            "",
            `?t=${this.currentTimeInSeconds}`
          );
          if (this.currentTimeInSeconds % 60 === 0) this.saveHistory(); // Only update history (and push to the server) every minute
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
          if (this.nextEpisode)
            this.$router.push({
              name: "youtube-view",
              params: {
                youtube_id: this.nextEpisode.youtube_id,
                lesson: this.nextEpisode.lesson,
              },
            });
        }
      }
    },
    async patchChannelID(video, channelId) {
      let data = await this.$directus.patchVideo({
        l2Id: this.$l2.id,
        id: video.id,
        query: "fields=id,channel_id",
        payload: { channel_id: channelId },
      });
      if (data) {
        video.channel_id = channelId;
      }
    },
    async patchDuration(video) {
      if (!this.$adminMode) return video;
      console.log(
        "YouTube View: Saved subtitles does not have duration, getting duration..."
      );
      video = await this.checkSubsAndAddLocalesIfNeeded(video);
      video = await this.getTranscript(video);
      if (video.subs_l2 && video.subs_l2[0] && video.subs_l2[0].duration) {
        let subs_l2 = this.$subs.unparseSubs(video.subs_l2);
        let data = await this.$directus.patchVideo({
          l2Id: this.$l2.id,
          id: video.id,
          query: "fields=id",
          payload: { subs_l2 },
        });
        console.log("Missing duration information added.");
        if (data) {
          video.channel_id = channelId;
        }
      }
      return video;
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
      this.$store.dispatch("history/add", data); // history's ADD_HISTORY_ITEM mutation automatically checks if this item is already in the history based on it's id (e.g. zh-video-Y23x9L4)
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
  justify-content: flex-end;
  padding-right: 1rem;
  z-index: 10;
  position: fixed;
  right: 0;
  .btn {
    color: white;
    text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
    border-radius: 0;
  }
  &.maximized {
    top: 0;
    width: 100%;
    right: 0;
    height: 4rem;
    .btn {
      background: rgba(0, 0, 0, 0.8);
      padding: 0.6rem 1.3rem;
    }
  }
}

.zerotohero-not-wide {
  .toggle-wrapper.maximized {
    top: calc(env(safe-area-inset-top) + 3rem);
  }
}

.zerotohero-wide {
  .youtube-view-content {
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

.youtube-view-content {
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
