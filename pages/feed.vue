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
  <container-query :query="query" v-model="params">
    <div class="main-dark pb-5">
      <!-- <VideoHero
        v-if="heroVideo"
        :video="heroVideo"
        @videoUnavailable="onVideoUnavailable"
      /> -->
      <div class="container pb-5">
        <SocialHead
          :title="`Learn ${$l2.name} with Videos | ${$l2.name} Zero to Hero`"
          :description="`Learn ${$l2.name} with Videos`"
          :image="'/img/tv-shows.jpg'"
        />
        <div class="row" v-if="items && items.length > 0">
          <div
            :class="colClasses"
            v-for="(item, index) in items"
            :key="`item-${$l2.code}-${index}`"
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
            <FeedItemLiveTV
              v-if="item.type === 'live-tv'"
              :channel="item.channel"
              skin="dark"
            />
          </div>
        </div>
        <div class="row">
          <div class="col-sm-12">
            <div
              :class="{
                'loader text-center': true,
                'd-none': !loading,
              }"
              style="margin: 7rem 0 15rem 0"
            >
              <Loader :sticky="true" message="Loading your feed..." />
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-sm-12">
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
  </container-query>
</template>

<script>
import Helper from "@/lib/helper";
import Config from "@/lib/config";
import { mapState } from "vuex";
import { ContainerQuery } from "vue-container-query";

export default {
  components: {
    ContainerQuery,
  },
  data() {
    return {
      items: [],
      savedWordsShuffled: [],
      tvShows: undefined,
      talks: undefined,
      musicShow: undefined,
      moviesShow: undefined,
      newsShow: undefined,
      loading: false,
      heroVideo: undefined,
      numVideosPerLoad: 6,
      numSavedWordsPerLoad: 3,
      numLiveTVChannelsPerLoad: 1,
      liveTVChannels: [],
      params: {},
      query: {
        xs: {
          minWidth: 0,
          maxWidth: 423,
        },
        sm: {
          minWidth: 423,
          maxWidth: 720,
        },
        md: {
          minWidth: 720,
          maxWidth: 960,
        },
        lg: {
          minWidth: 960,
          maxWidth: 1140,
        },
        xl: {
          minWidth: 1140,
        },
      },
    };
  },
  async created() {
    this.loadMoreItems();
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("shows")) {
        this.loadShows();
      }
      if (mutation.type.startsWith("stats/LOAD")) {
        if (this.items.length === 0) this.loadMoreItems();
      }
      if ((mutation.type = "savedWords/IMPORT_WORDS_FROM_JSON")) {
        this.loadSavedWords();
        if (this.items.length === 0) this.loadMoreItems();
      }
    });
    this.loadSavedWords();
    this.loadLiveTV()
  },
  beforeDestroy() {
    // you may call unsubscribe to stop the subscription
    this.unsubscribe();
  },
  computed: {
    ...mapState("stats", ["stats"]),
    ...mapState("savedWords", ["savedWords"]),
    colClasses() {
      let classes = { "feed-item-wrapper": true };
      classes = Object.assign(
        {
          "pl-0 pr-0 col-sm-12": this.params.xs || this.params.sm,
          "col-6": this.params.md || this.params.lg,
          "col-4": this.params.xl,
        },
        classes
      );
      return classes;
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
    async loadLiveTV() {
      const bannedChannels =  {
        zh: [
          "http://174.127.67.246/live330/playlist.m3u8", // NTD
        ],
      }
      const bannedKeywords = {
        zh: ["arirang", "cgtn", "rt", "新唐人"],
      }
      let code = this.$l2["iso639-3"];
      if (code === "nor") code = "nob"; // Use 'Bokmal' for Norwegian.
      let res = await axios.get(
        `${Config.server}data/live-tv-channels/${code}.csv.txt`
      );
      if (res && res.data) {
        let channels = Papa.parse(res.data, { header: true }).data;
        channels = Helper.uniqueByValue(channels, "url");
        channels = channels
          .filter((c) => c.url && c.url.startsWith("https://"))
          .filter((c) => c.category !== "XXX")
          .filter((c) => !c.name.includes("新唐人"));
        if (this.$l2.code in bannedChannels) {
          channels = channels.filter(
            (c) => !bannedChannels[this.$l2.code].includes(c.url)
          );
        }
        if (this.$l2.code in bannedKeywords) {
          channels = channels.filter((c) => {
            for (let keyword of bannedKeywords[this.$l2.code]) {
              if (
                c.url.includes(keyword) ||
                c.name.toLowerCase().includes(keyword)
              )
                return false;
            }
            return true;
          });
        }
        channels = channels.sort((a, b) =>
          a.name.localeCompare(b.name, this.$l2.locales[0])
        );
        this.liveTVChannels = Helper.shuffle(channels)
      }
    },
    async loadMoreItems() {
      if (this.loading) return;
      if (
        this.$store.state.stats.statsLoaded[this.$l2.code] &&
        this.savedWords
      ) {
        this.loading = true;
        let offset = this.randomOffset("allVideos", this.numVideosPerLoad);
        let videos = await this.getVideos({
          numVideos: this.numVideosPerLoad,
          sort: "youtube_id",
          offset,
        });
        let items = videos.map((video) => {
          return { video, type: "video" };
        });
        if (this.savedWordsShuffled.length > 0) {
          let savedWordItems = [];
          for (let i = 0; i < this.numSavedWordsPerLoad; i++) {
            let word = this.savedWordsShuffled.pop();
            if (word) savedWordItems.push({ type: "word", word });
          }
          items = items.concat(savedWordItems);
        }
        if (this.liveTVChannels.length > 0) {
          let liveTVChannelItems = []
          for (let i = 0; i < this.numLiveTVChannelsPerLoad; i++) {
            let channel = this.liveTVChannels.pop();
            if (channel) liveTVChannelItems.push({ type: "live-tv", channel });
          }
          items = items.concat(liveTVChannelItems);
        }
        this.items = this.items.concat(Helper.shuffle(items));
        // if (!this.heroVideo) this.loadHeroVideo();
        this.loading = false;
        return true;
      }
    },
    loadHeroVideo() {
      let videos = (this.items || [])
        .filter((item) => item.type === "video")
        .map((item) => item.video);
      let randomVideos = this.random(videos);
      if (randomVideos[0]) this.heroVideo = randomVideos[0];
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
        let response = await this.$directus.get(
          `${this.$directus.youtubeVideosTableName(
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
  overflow: hidden;
  padding: 0.5rem;
  .feed-item {
    background-color: #222;
    height: 100%;
  }
}
</style>