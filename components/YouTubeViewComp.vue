
<template>
  <LazyYouTubeWithTranscript
    v-if="video"
    ref="youtube"
    skin="dark"
    v-bind="{
      video,
      starttime,
      startLineIndex,
      show,
      showType,
      episodes,
      largeEpisodeCount,
      useAutoTextSize: true,
      showInfoButton: true,
      autoload: true,
      autoplay: false,
      forcePortrait: false,
      initialLayout,
    }"
    :key="`transcript-${video.youtube_id}`"
    @ended="updateEnded"
    @previous="goToPreviousEpisode"
    @next="goToNextEpisode"
    @currentTime="onCurrentTime"
    @updateLayout="onUpdateLayout"
  />
</template>

<script>
import YouTube from "@/lib/youtube";
import Helper from "@/lib/helper";
import Vue from "vue";
import { mapState } from "vuex";
import { LANGS_WITH_CONTENT } from "@/lib/utils/servers";

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
    initialLayout: {
      default: "vertical",
    },
    landscape: {
      default: false,
    },
  },
  data() {
    return {
      currentTime: 0,
      episodes: [],
      extrasLoaded: false,
      fetchDone: false,
      mountedDone: false,
      randomEpisodeYouTubeId: undefined,
      show: undefined,
      showType: undefined,
      startLineIndex: 0,
      video: undefined,
      largeEpisodeCount: undefined,
      starttime: 0,
    };
  },
  computed: {
    ...mapState("stats", ["stats"]),
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
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
  async fetch() {
    this.starttime = this.$route.query.t ? Number(this.$route.query.t) : 0;
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
        this.video = video;
        this.$emit("videoLoaded", {
          video,
          duration: this.$refs.youtube?.duration,
        });
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
     * Called when the show is loaded from this.setShow() after the shows.js store retrieves TV shows
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
    onUpdateLayout(layout) {
      this.$emit("updateLayout", layout);
    },
    onCurrentTime(currentTime) {
      if (this.currentTime !== currentTime) {
        this.currentTime = currentTime;
        this.$emit("currentTime", this.currentTime);
      }
    },
    async getEpisodes(episodeCount, limit) {
      // If we already have the episodes stored in the show (in Vuex), and the episodes include the current video, just return the episodes
      let videos = [];
      let sort =
        this.showType === "tv_show" || this.show.audiobook ? "title" : "-date";
      if (
        this.show.episodes &&
        this.show.episodes.find((s) => s.youtube_id === this.video.youtube_id)
      )
        videos = this.show.episodes;

      // News and YouTube channels are sorted by date
      // Audiobooks and TV Shows are sorted by title
      if (videos.length === 0) {
        let fields = "youtube_id,title,date";
        if (LANGS_WITH_CONTENT.includes(this.$l2.code))
          fields =
            fields +
            ",views,tags,category,locale,duration,made_for_kids,views,likes,comments";
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
          videos = [...videos, ...moreVideos];
        }

        // Make sure this video is included in the collection
        videos = [this.video, ...videos];
      }
      videos = Helper.uniqueByValue(videos, "youtube_id");
      if (sort === "-date") {
        videos = videos.sort((a, b) =>
          b.date ? b.date.localeCompare(a.date) : 0
        );
      } else {
        videos = videos.sort((a, b) =>
          a.title
            ? a.title.localeCompare(b.title, this.$l2.locales[0], {
                numeric: true,
              })
            : 0
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
          name: "video-view",
          params: {
            type: "youtube",
            youtube_id: this.previousEpisode.youtube_id,
            lesson: this.previousEpisode.lesson,
          },
        });
    },
    goToNextEpisode() {
      if (this.nextEpisode)
        this.$router.push({
          name: "video-view",
          params: {
            type: "youtube",
            youtube_id: this.nextEpisode.youtube_id,
            lesson: this.nextEpisode.lesson,
          },
        });
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
      let forceRefresh = this.$adminMode;
      let generated = false;
      let subs_l2 = await YouTube.getTranscript(
        video.youtube_id,
        video.l2Locale,
        video.l2Name,
        forceRefresh,
        generated
      );
      if (!subs_l2 || subs_l2.length === 0) {
        generated = true;
        subs_l2 = await YouTube.getTranscript(
          video.youtube_id,
          video.l2Locale || this.$l2.code,
          video.l2Name,
          forceRefresh,
          generated
        );
      }
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
    async updateEnded(ended) {
      if (ended !== this.ended) {
        this.ended = ended;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
</style>
