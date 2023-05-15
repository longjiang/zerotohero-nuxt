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
      type: String,
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

      // Retrieve missing information from YouTube
      this.getMissingVideoInfoFromYouTube(this.video);
    },
    async getVideoFromDB(directus_id) {
      let video = await this.$directus.getVideo({ id: directus_id, l2Id: this.$l2.id });
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
    async getMissingVideoInfoFromYouTube(video) {

    },
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
  },
};
</script>
<style lang="scss" scoped></style>
