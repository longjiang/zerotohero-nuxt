<!-- /components/YouTubeViewComp.vue -->
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
        showType,
        skin,
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
      @retranslate="retranslate(video)"
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
import { mapState } from "vuex";
import { shuffle, uniqueByValue, parseDuration } from "../lib/utils";
import videoLoaderMixin from "../lib/mixins/videoLoaderMixin";
import playlistMixin from "../lib/mixins/playlistMixin";
import showEpisodesMixin from "../lib/mixins/showEpisodesMixin";
import autoTranslateMixin from "../lib/mixins/autoTranslateMixin";
import historyMixin from "../lib/mixins/historyMixin";

export default {
  mixins: [
    videoLoaderMixin,
    playlistMixin,
    showEpisodesMixin,
    autoTranslateMixin,
    historyMixin,
  ],
  props: {
    skin: { default: "dark" },
    youtube_id: { type: String, required: true },
    directus_id: { type: Number, required: false },
    lesson: { type: String, required: false },
    mini: { type: Boolean, default: false, required: false },
    initialMode: { default: "subtitles" },
    landscape: { default: false },
    starttime: { default: 0 },
    autoTranslate: { type: Boolean, default: true },
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
      video: undefined,
      translating: false,
    };
  },
  computed: {
    ...mapState("stats", ["stats"]),
    ...mapState("shows", [
      "showsLoaded",
      "recommendedVideosLoaded",
      "recommendedVideos",
      "recommendedMusicVideos",
      "recommendedMusicVideosLoaded",
    ]),
    recommendedVideosLoadedForL2() {
      return this.recommendedVideosLoaded?.[this.$l2.code];
    },
    recommendedMusicVideosLoadedForL2() {
      return this.recommendedMusicVideosLoaded?.[this.$l2.code];
    },
    collection() {
      return this.showType === "tv_show" ? "tvShows" : "talks";
    },
    currentTimeEvery10Seconds() {
      return Math.floor(this.currentTime / 10) * 10;
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
      if (this.video?.subs_l2?.length > 0) this.checkingSubs = false;
    },
    playlist() {
      if (!this.playlist?.videos?.length) return;
      if (this.itemIndex === -1 && this.playlist?.videos?.length) {
        this.playlist.videos.unshift(this.video);
      }
    },
    recommendedVideosLoadedForL2(loaded) {
      if (loaded && this.$route.query.p === "recommended") {
        this.loadRecommendedVideosAsPlaylist();
      }
    },
    recommendedMusicVideosLoadedForL2(loaded) {
      if (loaded && this.$route.query.p === "recommended_music") {
        this.loadRecommendedMusicVideosAsPlaylist();
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
};
</script>
<style lang="scss" scoped></style>