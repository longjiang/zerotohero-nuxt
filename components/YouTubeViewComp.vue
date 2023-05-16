<template>
  <div class="youtube-view">
    <LazyVideoWithTranscript
      v-if="video"
      ref="youtube"
      v-bind="{
        type: 'youtube',
        cc: false,
        video,
        skin,
        related,
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
        initialMode,
        initialSize: this.mini ? 'mini' : 'regular',
      }"
      :key="`transcript-${video.youtube_id}`"
      @ended="onEnded"
      @previous="goToPreviousEpisode"
      @next="goToNextEpisode"
      @currentTime="onCurrentTime"
      @updateLayout="onUpdateLayout"
    />
  </div>
</template>

<script>
import YouTube from "@/lib/youtube";
import Vue from "vue";
import { mapState } from "vuex";
import {
  LANGS_WITH_CONTENT,
  queryString,
  shuffle,
  uniqueByValue,
  toCamelCase,
  logError,
} from "@/lib/utils";

export default {
  props: {
    skin: {
      default: "dark",
    },
    youtube_id: {
      type: String,
      required: true,
    },
    directus_id: {
      type: Number,
      required: false,
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
    initialMode: {
      default: "subtitles",
    },
    landscape: {
      default: false,
    },
    starttime: {
      default: 0,
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
    };
  },
  computed: {
    ...mapState("stats", ["stats"]),
    ...mapState("shows", ["showsLoaded"]),
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
    related() {
      let related = [];
      if (this.episodes && this.episodes.length > 0 && this.episodeIndex >= 0) {
        let watchedYouTubeIds = this.$store.state.history.history.map(
          (h) => h.video?.youtube_id
        );
        let popularEpisodes = this.episodes
          .slice()
          .filter((e) => !watchedYouTubeIds.includes(e.youtube_id))
          .sort((a, b) => b.views - a.views);
        related = [
          ...shuffle([
            ...this.episodes.slice(
              this.episodeIndex + 2,
              this.episodeIndex + 16
            ),
            ...shuffle(popularEpisodes.slice(0, 16)),
          ]),
        ];
        let nextEpisode = this.episodes[this.episodeIndex + 1];
        if (nextEpisode) related = [nextEpisode, ...related];
      }
      return uniqueByValue(related, "youtube_id");
    },
  },
  async mounted() {
    await this.loadVideo(this.youtube_id, this.directus_id);
  },
  methods: {
    /**
     * Streamline the video loading process.
     *
     * This function handles the loading of a video with a given YouTube ID and
     * an optional Directus ID. If the Directus ID is provided, the function
     * retrieves the video information and subtitles from our database.
     * Any missing information is then retrieved from YouTube.
     *
     * Additionally, the video is associated with a TV show (ID) and talk (ID).
     * The system loads all TV show and talk information in the background.
     * Once the information is loaded, the episodes of the TV show or talk
     * this video belongs to are retrieved.
     *
     * @function loadVideo
     * @param {string} youtube_id - The YouTube ID of the video.
     * @param {string} [directus_id] - The optional Directus ID of the video.
     * @returns {Promise} A promise that resolves when the video, subtitles,
     *                    and associated TV show and talk information are loaded.
     */
    async loadVideo(youtube_id, directus_id) {
      // Set video ID
      this.video = { youtube_id };

      // If directus_id is present, retrieve video info and subs from our database
      if (directus_id) {
        const video = await this.getVideoFromDB(directus_id);
        this.video = video;
      }

      const showType = this.getShowType(this.video);

      this.loadShowAndEpisodes({ showId: this.video[showType], showType });

      // Retrieve missing information from YouTube
      this.getMissingVideoInfoFromYouTube(this.video);
    },
    loadShowAndEpisodes({ showId, showType }) {
      if (this.showsLoaded?.[this.$l2.code]) {
        if (!this.show) this.setShow({ showId, showType });
      }
      this.unsubscribe = this.$store.subscribe((mutation, state) => {
        if (mutation.type === "shows/LOAD_SHOWS") {
          if (!this.show) this.setShow({ showId, showType });
        }
      });
    },
    setShow({ showId, showType }) {
      const camelCaseShowType = toCamelCase(showType);
      const show = this.$store.getters[`shows/${camelCaseShowType}`]({
        id: showId,
        l2: this.$l2,
      });
      if (show) {
        this.show = show;
        this.showType = showType;
        this.setEpisodesAndEpisodeCount();
      }
    },
    async setEpisodesAndEpisodeCount() {
      let limit = 100;
      let episodeCount = await this.getEpisodeCount();
      if (episodeCount > limit && this.$refs.youtube)
        this.largeEpisodeCount = episodeCount;
      this.episodes = await this.getEpisodes(episodeCount, limit);
      console.log(
        `YouTube View: Show "${this.show.title}" loaded with ${episodeCount} episodes.`
      );
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
        let fields = "id,youtube_id,title,date";
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
          query: queryString(postParams),
        });
        if (moreVideos) {
          videos = [...videos, ...moreVideos];
        }

        // Make sure this video is included in the collection
        videos = [this.video, ...videos];
      }
      videos = uniqueByValue(videos, "youtube_id");
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
    getShowType(video) {
      let showType = false;

      if (video.tv_show) {
        showType = "tv_show";
      } else if (video.talk) {
        showType = "talk";
      }

      return showType;
    },
    async getVideoFromDB(directus_id) {
      let video = await this.$directus.getVideo({
        id: directus_id,
        l2Id: this.$l2.id,
      });
      if (video) {
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
    async getMissingVideoInfoFromYouTube(video) {},
    onUpdateLayout(layout) {
      this.$emit("updateLayout", layout);
    },
    onCurrentTime(currentTime) {
      if (this.currentTime !== currentTime) {
        this.currentTime = currentTime;
        this.$emit("currentTime", this.currentTime);
      }
    },
    async onEnded(ended) {
      if (ended !== this.ended) {
        this.ended = ended;
      }
    },
    goToPreviousEpisode() {
      if (this.previousEpisode)
        this.$router.push({
          name: "video-view",
          params: {
            type: "youtube",
            youtube_id: this.previousEpisode.youtube_id,
            directus_id: this.previousEpisode.id,
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
            directus_id: this.nextEpisode.id,
            lesson: this.nextEpisode.lesson,
          },
        });
    },
  },
};
</script>
<style lang="scss" scoped></style>
