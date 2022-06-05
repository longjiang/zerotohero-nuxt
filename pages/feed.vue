<router>
  {
    path: '/:l1/:l2/feed',
    props: true,
    meta: {
      skin: 'dark'
    }
  }
</router>
<template>
  <div class="main-dark pb-5">
    <VideoHero
      v-if="heroVideo"
      :video="heroVideo"
      @videoUnavailable="onVideoUnavailable"
    />
    <div class="container pb-5">
      <SocialHead
        :title="`Learn ${$l2.name} with Videos | ${$l2.name} Zero to Hero`"
        :description="`Learn ${$l2.name} with Videos`"
        :image="'/img/tv-shows.jpg'"
      />
      <div class="row mt-4">
        <div class="pl-0 pr-0 col-sm-12">
          <div
            :class="{
              'loader text-center': true,
              'd-none': !loading,
            }"
            style="margin: 7rem 0 15rem 0"
          >
            <Loader :sticky="true" message="Loading your feed..." />
          </div>

          <div v-if="!loading">
            <div v-if="items && items.length > 0">
              <div
                class="feed-item-wrapper"
                v-for="(item, index) in items"
                :key="`item-${index}`"
              >
                <FeedItemVideo
                  v-if="item.type === 'video'"
                  :video="item.video"
                  skin="dark"
                />
                <FeedItemWord
                  v-if="item.type === 'word'"
                  :savedWord="item.word"
                  skin="dark"
                />
              </div>
            </div>
          </div>

          <client-only>
            <LazyIdenticalLanguages
              class="mt-5 mb-5"
              routeName="all-media"
              v-if="!loading"
            />
          </client-only>
        </div>
      </div>
      <div v-observe-visibility="visibilityChanged"></div>
    </div>
  </div>
</template>

<script>
import Helper from "@/lib/helper";
import Config from "@/lib/config";
import { mapState } from "vuex";

export default {
  data() {
    return {
      items: [],
      savedWordsShuffled: [],
      tvShows: undefined,
      talks: undefined,
      musicShow: undefined,
      moviesShow: undefined,
      newsShow: undefined,
      loading: true,
      heroVideo: undefined,
    };
  },
  async mounted() {
    this.loadMoreItems();
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("shows")) {
        this.loadShows();
      }
      if (mutation.type.startsWith("stats/LOAD")) {
        this.loadMoreItems()
      }
      if ((mutation.type = "savedWords/IMPORT_WORDS_FROM_JSON")) {
        this.loadSavedWords();
        this.loadMoreItems()
      }
    });
    this.loadSavedWords();
    this.loading = false; // Incase resources fail to load, at least show them
  },
  beforeDestroy() {
    // you may call unsubscribe to stop the subscription
    this.unsubscribe();
  },
  computed: {
    ...mapState("stats", ["stats"]),
    ...mapState("savedWords", ["savedWords"]),
    audiobooks() {
      return this.talks.filter((t) => t.audiobook);
    },
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
  },
  watch: {
    loading() {
      if (this.loading === false) this.loadHeroVideo();
    },
  },
  methods: {
    visibilityChanged(visible) {
      if (visible) {
        this.loadMoreItems();
      }
    },
    assignShowsToVideos(videos) {
      for (let video of videos) {
        if (this.tvShows) {
          if (video.tv_show) {
            video.tv_show = this.tvShows.find((s) => s.id === video.tv_show);
          }
          if (video.talk) {
            video.talk = this.talks.find((s) => s.id === video.talk);
          }
        }
      }
    },
    loadSavedWords() {
      if (
        this.savedWordsShuffled.length === 0 &&
        this.savedWords &&
        this.savedWords[this.$l2.code]
      ) {
        this.savedWords[this.$l2.code];
        let savedWordsShuffled = [...this.savedWords[this.$l2.code]];
        this.savedWordsShuffled = Helper.shuffle(savedWordsShuffled);
      }
    },
    async loadMoreItems() {
      if (!this.$store.state.stats.statsLoaded[this.$l2.code]) return;
      if (!this.savedWords) return
      let numVideos = 10;
      let numWords = 2;
      let offset = this.randomOffset("allVideos", numVideos);
      let videos = await this.getVideos({
        numVideos,
        sort: "youtube_id",
        offset,
      });
      let items = videos.map((video) => {
        return { video, type: "video" };
      });
      if (this.savedWordsShuffled.length > 0) {
        let savedWordItems = [];
        for (let i = 0; i < numWords; i++) {
          let word = this.savedWordsShuffled.pop();
          savedWordItems.push({ type: "word", word });
        }
        items = items.concat(savedWordItems);
      }
      this.items = this.items.concat(Helper.shuffle(items));
      return true;
    },
    loadHeroVideo() {
      let randomVideos = this.random([
        ...(this.items || []).filter((item) => item.type === "video"), // Let's not feature non-tv-show non-talk videos
      ]);
      if (randomVideos[0]) this.heroVideo = randomVideos[0].video;
    },
    onVideoUnavailable(youtube_id) {
      if (this.heroVideo.youtube_id === youtube_id) {
        this.videoUnavailable = true;
        if (this.videos) {
          this.videos = this.videos.filter(
            (v) => v.youtube_id !== this.heroVideo.youtube_id
          );
        }
        this.loadHeroVideo();
      }
    },
    async loadShows() {
      this.tvShows = this.$store.state.shows.tvShows[this.$l2.code];
      this.talks = this.$store.state.shows.talks[this.$l2.code];
      if (this.tvShows) {
        this.musicShow = this.$store.state.shows.tvShows[this.$l2.code].find(
          (s) => s.title === "Music"
        );
        this.moviesShow = this.$store.state.shows.tvShows[this.$l2.code].find(
          (s) => s.title === "Movies"
        );
      }
      if (this.talks) {
        this.newsShow = this.$store.state.shows.talks[this.$l2.code].find(
          (s) => s.title === "News"
        );
      }
    },
    /**
     * @param statsKey key in the stats, one of: 'allVideos', 'movies', 'newVideos', 'music', 'news'
     * @param max maximum number of array items
     */
    randomOffset(statsKey, max) {
      if (this.stats && this.stats[this.$l2.code]) {
        let stats = this.stats[this.$l2.code][statsKey];
        // If we only have so many videos, we don't need arandom offset
        if (stats < max) return 0;
        else {
          let offset = Math.floor(Math.random() * (stats - max));
          return offset;
        }
      }
      return 0;
    },
    random(array, max) {
      let shuffled = Helper.shuffle([...array]);
      return shuffled.slice(0, max);
    },
    /**
     * Retrieve videos from Directus.
     * @param limit maximum number of videos to retrieve
     * @param tvShow id of the TV show,
     * @param talk id of the talk
     * @param sort how the resort should be sorted
     */
    async getVideos({
      limit = 10,
      tvShow = undefined,
      talk = undefined,
      sort = "-date",
      offset = 0,
    }) {
      try {
        let videos = [];
        let filter = "";
        if (tvShow) filter = `filter[tv_show][eq]=${tvShow}`;
        if (talk) filter = `filter[talk][eq]=${talk}`;
        // First find videos associated with a particular tv show, or talk
        let response = await this.$authios.get(
          `${Config.youtubeVideosTableName(
            this.$l2.id
          )}?sort=${sort}&filter[l2][eq]=${
            this.$l2.id
          }&${filter}&limit=${limit}&fields=l2,id,title,youtube_id,tv_show.id,tv_show.title,talk.id,talk.title,talk.audiobook,date,l2&offset=${offset}`
        );
        if (response.data.data && response.data.data.length > 0) {
          videos = Helper.uniqueByValue(response.data.data, "youtube_id");
        }

        return videos;
      } catch (err) {
        return [];
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.feed-item-wrapper {
  border-bottom: 0.5rem solid rgb(40, 40, 40);
  overflow: hidden;
}
</style>