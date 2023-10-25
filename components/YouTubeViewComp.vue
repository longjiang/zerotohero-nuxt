<template>
  <div class="youtube-view">
    <SocialHead
      :title="`${video && video.title ? video.title + ' | ' : ''}Learn ${
        $l2.name
      } with Language Player`"
      description="Study the transcript of this video with a popup dictionary"
      :image="`https://img.youtube.com/vi/${this.youtube_id}/hqdefault.jpg`"
    />
    <LazyVideoWithTranscript
      v-if="video"
      ref="youtube"
      v-bind="{
        autoload: true,
        autoplay: true,
        cc: false,
        checkingSubs,
        episodes: playlist && playlist.videos && playlist.videos.length ? playlist.videos : episodes,
        episodeSort,
        forcePortrait: false,
        initialMode,
        initialSize: this.mini ? 'mini' : 'regular',
        largeEpisodeCount,
        playlist,
        related,
        show,
        showInfoButton: true,
        showQuiz,
        showType,
        skin,
        startLineIndex,
        starttime,
        type: 'youtube',
        useAutoTextSize: true,
        video,
      }"
      :key="`transcript-${video.youtube_id}`"
      @ended="onEnded"
      @previous="goToPreviousItem"
      @next="goToNextItem"
      @currentTime="onCurrentTime"
      @updateLayout="onUpdateLayout"
    />
    <!-- Modal for a countdown after the video finishes playing, vertically centered -->
    <b-modal
      id="countdown-modal"
      :title="
        $t('Next video in {seconds} seconds', {
          seconds: nextVideoCountDownSeconds,
        })
      "
      @ok="goToNextItem"
      @cancel="stopNextEpisodeCountdown"
      @hidden="stopNextEpisodeCountdown"
      :hide-footer="true"
      centered
    >
      <LazyYouTubeVideoCard
        ref="nextYouTubeVideoCard"
        skin="light"
        v-bind="nextVideoProps"
      >
        <template v-slot:footer>
          <slot name="footer" :video="video"></slot>
        </template>
      </LazyYouTubeVideoCard>
    </b-modal>
  </div>
</template>

<script>
import YouTube from "../lib/youtube";
import DateHelper from "../lib/date-helper";
import Vue from "vue";
import { mapState } from "vuex";
import {
  PYTHON_SERVER,
  level,
  levelByDifficulty,
  shuffle,
  uniqueByValue,
  toCamelCase,
  parseDuration,
  proxy,
} from "../lib/utils";

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
    showQuiz: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      checkingSubs: false,
      currentTime: 0,
      episodes: [],
      episodeSort: "title",
      extrasLoaded: false,
      fetchDone: false,
      l1Locale: undefined,
      l2Locale: undefined,
      l2Name: undefined,
      largeEpisodeCount: undefined,
      mountedDone: false,
      nextVideoCountDownSeconds: 8,
      playlist: undefined,
      randomEpisodeYouTubeId: undefined,
      savedToHistory: false,
      show: undefined,
      showType: undefined,
      startLineIndex: 0,
      video: undefined,
    };
  },
  computed: {
    ...mapState("stats", ["stats"]),
    ...mapState("shows", [
      "showsLoaded",
      "recommendedVideosLoaded",
      "recommendedVideos",
    ]),
    recommendedVideosLoadedForL2() {
      return this.recommendedVideosLoaded?.[this.$l2.code];
    },
    collection() {
      return this.showType === "tv_show" ? "tvShows" : "talks";
    },
    currentTimeEvery10Seconds() {
      let t = Math.floor(this.currentTime / 10) * 10;
      return t;
    },
    items() {
      return this.playlist?.videos?.length
        ? this.playlist.videos
        : this.episodes;
    },
    itemIndex() {
      return this.items.findIndex(
        (e) => e.youtube_id === this.video?.youtube_id
      );
    },
    previousItem() {
      if (this.items && this.itemIndex > -1) {
        return this.items[this.itemIndex - 1];
      }
    },
    nextItem() {
      if (this.items && this.itemIndex > -1) {
        return this.items[this.itemIndex + 1];
      }
    },
    nextVideoProps() {
      let props = {
        video: this.nextItem,
        episodeSort: this.episodeSort,
      };
      if (this.playlist?.id) props.playlistId = this.playlist.id;
      return props;
    },
    related() {
      let related = [];
      if (this.episodes && this.episodes.length > 0 && this.itemIndex >= 0) {
        let watchedYouTubeIds = this.$store.state.history.history.map(
          (h) => h.video?.youtube_id
        );
        let popularEpisodes = this.episodes
          .slice()
          .filter((e) => !watchedYouTubeIds.includes(e.youtube_id))
          .sort((a, b) => b.views - a.views);
        related = [
          ...shuffle([
            ...this.episodes.slice(this.itemIndex + 2, this.itemIndex + 16),
            ...shuffle(popularEpisodes.slice(0, 16)),
          ]),
        ];
        let nextItem = this.episodes[this.itemIndex + 1];
        if (nextItem) related = [nextItem, ...related];
      }
      return uniqueByValue(related, "youtube_id");
    },
  },
  watch: {
    "video.subs_l2"() {
      if (this.video?.subs_l2?.lenghth > 0) this.checkingSubs = false;
    },
    playlist() {
      if (!this.playlist?.videos?.length) return;
      // If this is a recommended videos playlist, when the page refreshes, a new batch of videos is loaded and this video may not be one of them
      // If this is the case, we prepend this.video to the playlist
      if (this.itemIndex === -1 && this.playlist?.videos?.length) {
        // Prepend this.video to the playlist
        this.playlist.videos.unshift(this.video);
      }
    },
    recommendedVideosLoadedForL2(loaded) {
      console.log("recommendedVideosLoadedForL2", loaded);
      if (loaded) {
        if (this.$route.query.p === "recommended") {
          this.loadRecommendedVideosAsPlaylist();
        }
      }
    },
  },
  async mounted() {
    this.episodeSort = this.$route.query.sort || "title";
    await Promise.all([
      this.loadVideo(this.youtube_id, this.directus_id),
      this.handlePlaylistFromQueryString(),
    ]);
  },
  filters: {
    formatDuration(duration) {
      if (duration) {
        return parseDuration(duration);
      }
    },
  },
  methods: {
    showDifficultyToast() {
      if (this.video?.difficulty) {
        const l = levelByDifficulty(this.video.difficulty, this.$l2.code);
        const levelName = level(l, this.$l2).name;
        this.$toast.show(
          this.$tb("This is a {level} level video.", { level: levelName }),
          {
            position: "top-center",
            className: `bg-level${l}`,
            containerClass: "safe-padding-top",
            iconPack: "custom-class",
            icon: "fa-solid fa-signal-bars mr-1",
            duration: 3000,
          }
        );
      }
    },
    async handlePlaylistFromQueryString() {
      // Get the playlist from the store based on the query string
      if (this.$route.query.p) {
        let playlist;
        // Check if the playlist ID is a number
        if (!isNaN(this.$route.query.p)) {
          const playlistId = Number(this.$route.query.p);
          playlist = await this.$store.dispatch("playlists/fetchPlaylist", {
            l2: this.$l2,
            id: playlistId,
          });
        } else if (this.$route.query.p === "recommended") {
          // loadRecommendedVideosAsPlaylist is called again in the watcher because we have to wait until the computed value recommendedVideosLoadedForL2 is true (from the store)
          this.loadRecommendedVideosAsPlaylist();
        } else {
          // The playlist querystring value is a comma-separated list of ids passed from YouTubeVideoList (so we can play the next videos from the list)
          let ids = this.$route.query.p.split(",").map((id) => Number(id));

          let videos = await this.$directus.getVideos({
            l2Id: this.$l2.id,
            query: `filter[id][in]=${ids.join(",")}`,
          });
          // Match the order of the videos in the playlist with the order of the ids in the query string
          videos = videos.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
          playlist = {
            l2: this.$l2.id,
            id: this.$route.query.p,
            title: "Playlist",
            videos,
          };
        }
        if (playlist) {
          this.playlist = playlist;
        }
      }
    },
    loadRecommendedVideosAsPlaylist() {
      console.log("Loading recommended videos as playlist");
      if (!this.recommendedVideosLoadedForL2) return;
      let playlist = {
        l2: this.$l2.id,
        id: "recommended",
        title: "Recommended Videos",
        videos: this.recommendedVideos[this.$l2.code],
      };
      this.playlist = playlist;
      // If the playlist is 'recommended', and this is near last video in the playlist, we load more recommended videos
      if (this.itemIndex > this.items.length - 3) {
        console.log("🍉 Loading more recommended videos");
        this.$store.dispatch("shows/loadRecommendedVideos", {
          userId: this.$auth.user?.id,
          l2: this.$l2,
        });
      }
    },
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
      this.checkingSubs = true;
      try {
        // Retrieve video info and subs from our database
        const video = await this.getVideoFromDB(youtube_id, directus_id);

        this.video = video || this.video;
        this.showDifficultyToast();
        this.loadTokenizationServerCache(video);

        if (this.video.tv_show || this.video.talk) this.loadShowAndEpisodes();

        // Retrieve missing information from YouTube
        await this.loadTranscriptLocalesFromYouTube(this.video);
        await Promise.all([
          this.loadMissingSubsFromYouTube(this.video),
          this.loadMissingMetaFromYouTube(this.video),
        ]);
      } catch (err) {
        console.error(err);
      }
      this.checkingSubs = false;
      return; // Must return a promise
    },
    async loadTokenizationServerCache(video) {
      if (!video?.id) return;
      let url = `${PYTHON_SERVER}lemmatize-video?video_id=${video.id}&lang=${this.$l2.code}`;
      const data = await proxy(url);
      // Check if data is an object with content
      if (data && typeof data === "object" && Object.keys(data).length > 0) {
        const dictionary = await this.$getDictionary();
        dictionary.loadTokenizationServerCache(data);
      }
    },
    loadShowAndEpisodes() {
      if (this.showsLoaded?.[this.$l2.code]) {
        if (!this.show) this.setShow();
      }
      this.unsubscribe = this.$store.subscribe((mutation, state) => {
        if (mutation.type === "shows/LOAD_SHOWS") {
          if (!this.show) this.setShow();
        }
      });
    },
    getShowTypeAndShow(video) {
      let foundShowType, foundShow;

      for (let showType of ["tv_show", "talk"]) {
        if (video[showType]) {
          foundShowType = showType;
          const camelCaseShowType = toCamelCase(showType);
          foundShow = this.$store.getters[`shows/${camelCaseShowType}`]({
            id: video[showType],
            l2: this.$l2,
          });
          if (foundShow) break;
        }
      }

      return { showType: foundShowType, show: foundShow };
    },
    setShow() {
      let { showType, show } = this.getShowTypeAndShow(this.video);
      if (show) {
        this.show = show;
        this.showType = showType;
        this.setEpisodesAndEpisodeCount();
      }
    },
    async setEpisodesAndEpisodeCount() {
      let limit = 5;
      let episodeCount = await this.getEpisodeCount();
      if (episodeCount)
        this.$store.dispatch("shows/setEpisodeCount", {
          l2: this.$l2,
          collection: this.collection,
          showId: this.show.id,
          episodeCount,
        });
      if (episodeCount > limit && this.$refs.youtube)
        this.largeEpisodeCount = episodeCount;
      this.episodes = await this.getEpisodes(episodeCount, limit);
      console.log(
        `YouTube View: Show "${this.show.title}" loaded with ${episodeCount} episodes.`
      );
    },
    /**
     * Get the episodes for this show
     * @param {number} episodeCount - The number of episodes in this show (used to determine if we need to get more episodes)
     * @param {number} limit - The number of episodes to get
     */
    async getEpisodes(episodeCount, limit) {
      // We assume that this is a LONG show with hundreds or even thousands of episodes (like News, Music, or some TV station show
      // Let's grab the videos immediately PRIOR and AFTER the current video, so the user can eventually paginate through all the episodes.
      // If sort is '-date', the user wants to see contents that are around the same date.
      // If sort is 'title', the user wants to see contents with similar alpha-sorted titles
      let filters = {};
      if (episodeCount > limit) {
        if (this.episodeSort === "title") {
          filters["filter[title][gt]"] = this.video.title;
        }
        if (this.episodeSort === "-date") {
          filters["filter[date][lt]"] = this.video.date;
        }
        if (this.episodeSort === "-views") {
          filters["filter[views][lt]"] = this.video.views;
        }
        if (this.episodeSort === "difficulty") {
          filters["filter[difficulty][gt]"] = this.video.difficulty;
        }
      }
      let videos = await this.$store.dispatch("shows/getEpisodesFromServer", {
        l2: this.$l2,
        collection: this.collection,
        showId: this.show.id,
        filters,
        forceRefresh: this.$adminMode,
        limit,
        sort: this.episodeSort,
      });

      // Make sure this video is included in the collection
      videos = [this.video, ...videos];

      videos = uniqueByValue(videos, "youtube_id");
      if (this.episodeSort === "title") {
        videos = videos.sort((a, b) =>
          a.title
            ? a.title.localeCompare(b.title, this.$l2.locales[0], {
                numeric: true,
              })
            : 0
        );
      } else if (this.episodeSort === "-date") {
        videos = videos.sort((a, b) =>
          b.date ? b.date.localeCompare(a.date) : 0
        );
      } else if (this.episodeSort === "-views") {
        videos = videos.sort((a, b) => b.views - a.views);
      }

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
      return episodeCount;
    },
    async getVideoFromDB(youtube_id, directus_id) {
      let video;
      if (directus_id) {
        video = await this.$directus.getVideo({
          id: directus_id,
          l2Id: this.$l2.id,
        });
        // We assume the video's youtube_id, if present, is always correct.
        // So if this video's youtube_id does not match the youtube_id, we look for the video with the youtube_id in our database.
        if (youtube_id && video?.youtube_id !== youtube_id) {
          video = null;
        }
      }
      // If we still don't have a video, we look for the video with the youtube_id in our database.
      if (!video && youtube_id) {
        let videos = await this.$directus.getVideos({
          l2Id: this.$l2.id,
          query: `filter[youtube_id][eq]=${youtube_id}`,
        });
        if (videos?.length > 0) video = videos[0];
      }
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
    async getSubs({ youtube_id, locale, name, generated = false }) {
      let forceRefresh = this.$adminMode;
      let subs = await YouTube.getTranscript(
        youtube_id,
        locale,
        name,
        forceRefresh,
        generated
      );
      return subs;
    },
    async loadTranscriptLocalesFromYouTube(video) {
      // If the video either doesn't have L2 subtitles, or doesn't have L1 subtitles, we retrieve the locales of the subtitles from YouTube
      if (!(video?.subs_l2?.length > 0) || !(video?.subs_l1?.length > 0)) {
        let { l1Locale, l2Locale, l2Name } = await YouTube.getTranscriptLocales(
          video.youtube_id,
          this.$l1,
          this.$l2
        );
        this.l1Locale = l1Locale;
        this.l2Locale = l2Locale;
        this.l2Name = l2Name;
      }
    },
    async loadMissingSubsFromYouTube(video) {
      // If the video doesn't have L1 or L2 subtitles, we load it from YouTube
      // Do not load L1 subs if the current $l1 and $l2 are the same
      let generated = false;
      for (let l1OrL2 of this.$l1 === this.$l2 ? ["l2"] : ["l2", "l1"]) {
        if (!(video?.[`subs_${l1OrL2}`]?.length > 0)) {
          let subs;
          let locale = this[`${l1OrL2}Locale`];
          generated = locale ? false : true; // If we don't have the locale from YouTube, that means that the subs are generated
          subs = await this.getSubs({
            youtube_id: video.youtube_id,
            locale: this[`${l1OrL2}Locale`] || this[`$${l1OrL2}`].code,
            name: this[`${l1OrL2}Name`],
            generated,
          });
          // In the case of L1 subtitles, if we still don't have it, we get translated ones
          if (l1OrL2 === "l1" && !(subs?.length > 0)) {
            let tlangs = this.$l1.locales;
            subs = await YouTube.getTranslatedTranscript({
              youtube_id: video.youtube_id,
              locale: this.l2Locale || this.$l2.code,
              name: this.l2Name,
              tlangs,
              generated,
            });
          }
          if (subs && subs.length > 0)
            this.$store.commit("shows/MODIFY_ITEM", {
              item: video,
              key: `subs_${l1OrL2}`,
              value: subs,
            });
          this.$emit(`${l1OrL2}TranscriptLoaded`);
        }
      }
    },
    async loadMissingMetaFromYouTube(video) {
      // If the video has other missing information, we load it from YouTube
      const properties = [
        "category",
        "comments",
        "date",
        "duration",
        "likes",
        "channel",
        "locale",
        "made_for_kids",
        "tags",
        "title",
        "views",
      ];

      if (!properties.every((property) => property in this.video)) {
        const videoData = await YouTube.videoByApi(this.youtube_id);
        if (videoData)
          properties.forEach((property) => {
            if (!video[property] && videoData[property])
              Vue.set(video, property, videoData[property]);
          });
      }
    },
    onUpdateLayout(layout) {
      this.$emit("updateLayout", layout);
    },
    onCurrentTime(currentTime) {
      if (this.currentTime !== currentTime) {
        this.currentTime = currentTime;
        if (this.currentTime > 0 && !this.savedToHistory) {
          this.saveHistory(); // Save history to the server the first time the user starts watching the video
          this.savedToHistory = true;
        }
        this.updateCurrentTimeQueryString();
        this.$emit("currentTime", this.currentTime);
      }
    },
    async onEnded(ended) {
      if (ended !== this.ended) {
        this.ended = ended;
        this.$emit("ended", this.ended);
        if (this.ended && this.episodes?.length) {
          if (this.itemIndex !== this.episodes.length - 1) {
            // If this is not the last video in the playlist, we show the countdown modal
            this.$bvModal.show("countdown-modal");
            // Start the countdown
            this.nextVideoCountDownSeconds = 8;
            let interval = setInterval(() => {
              if (!this.ended) clearInterval(interval);
              this.nextVideoCountDownSeconds--;
              if (this.nextVideoCountDownSeconds === 0) {
                clearInterval(interval);
                this.$bvModal.hide("countdown-modal");
                this.goToNextItem();
              }
            }, 1000);
          }
        }
      }
    },
    stopNextEpisodeCountdown() {
      this.$bvModal.hide("countdown-modal");
      this.nextVideoCountDownSeconds = 8;
      this.ended = false;
    },
    goToPreviousItem() {
      if (this.previousItem)
        this.$router.push({
          name: "l1-l2-video-view-type",
          params: {
            type: "youtube",
            l1: this.$l1.code,
            l2: this.$l2.code,
          },
          query: {
            v: this.previousItem.youtube_id,
            id: this.previousItem.id,
            lesson: this.previousItem.lesson,
            p: this.playlist?.id,
            sort: this.episodeSort,
          },
        });
    },
    goToNextItem() {
      if (this.nextItem)
        this.$router.push({
          name: "l1-l2-video-view-type",
          params: {
            type: "youtube",
            l1: this.$l1.code,
            l2: this.$l2.code,
          },
          query: {
            v: this.nextItem.youtube_id,
            id: this.nextItem.id,
            lesson: this.nextItem.lesson,
            p: this.playlist?.id,
            sort: this.episodeSort,
          },
        });
    },
    updateCurrentTimeQueryString() {
      if (this.size === "mini") return;
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        const params = new URLSearchParams(url.search);
        const queryStringTime = params.get("t") ? Number(params.get("t")) : 0;

        if (this.currentTimeEvery10Seconds !== queryStringTime) {
          // update the t value while retaining other query string parameters
          params.set("t", this.currentTimeEvery10Seconds);
          const newUrl = `${url.origin}${url.pathname}?${params.toString()}`;
          window.history.replaceState("", "", newUrl);

          if (this.currentTimeEvery10Seconds % 60 === 0) {
            this.saveHistory(); // Only update history (and push to the server) every minute
          }
        }
      }
    },
    async saveHistory() {
      if (this.size === "mini") return;
      if (this.video?.youtube_id) {
        let data = {
          date: DateHelper.unparseDate(new Date()),
          l2: Number(this.$l2.id),
          video_id: Number(this.video.id),
          last_position: this.currentTimeEvery10Seconds,
          video: this.video, // This is not saved to the server, but it's used to display the video in the history
        };
        await this.$store.dispatch("watchHistory/addOrUpdate", data);
      }
    },
  },
};
</script>
<style lang="scss" scoped></style>
