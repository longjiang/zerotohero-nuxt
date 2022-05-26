<router>
  {
    path: '/:l1/:l2/language-info',
    props: true,
  }
</router>
<template>
  <div class="main pt-5 pb-5">
    <div class="row">
      <div class="col-sm-12" style="max-width: 50rem; margin: 0 auto">
        <div v-if="$route.params.l1 && $route.params.l1 && $l1 && $l2">
          <div :class="{ 'pl-1 pr-1 pb-2': true }">
            <h4 class="text-center mb-4">About the {{ $l2.name }} Language</h4>
            <LazyLanguageInfoBox :lang="$l2" class="mb-4" />
            <p>
              <b>ISO639-1:</b>
              {{ $l2["iso639-1"] || "Not available" }}
            </p>
            <p>
              <b>ISO639-3:</b>
              {{ $l2["iso639-3"] || "Not available" }}
            </p>
            <p>
              <b>Language ID:</b>
              {{ $l2.id || "Not available" }}
            </p>
            <p>
              <b>Scripts used:</b>
              {{
                $l2.scripts
                  ? $l2.scripts.map((s) => s.script).join(", ")
                  : "Not available"
              }}
            </p>
            <p>
              <b>Number of Speakers:</b>
              {{ $l2.speakers ? $n($l2.speakers) : "Not available" }}
            </p>
            <p>
              <b>Speakers native to:</b>
              <span
                v-for="c in $l2.country"
                :key="`lang-country-${c.alpha2Code}`"
                style="margin-right: 0.5rem"
              >
                <img
                  :src="`/vendor/flag-svgs/${c.alpha2Code}.svg`"
                  class="flag-icon mr-1"
                />
                {{ c.name }}
              </span>
            </p>
          </div>
          <div :class="{ 'pl-1 pr-1 pb-2 pt-5': true }" v-if="$l2.han">
            <h4 class="text-center mb-4">Dialects of Chinese</h4>
            <p class="text-center">Bar graph shows number of speakers.</p>
            <Dialects skin="light" />
          </div>
          <div :class="{ 'pl-1 pr-1 pb-2 pt-5': true }" v-if="$l2.han">
            <h4 class="text-center">56 Ethnic Groups of China</h4>
            <p class="text-center">Bar graph shows number of speakers. (2010 Numbers)</p>
            <FiftySixEthnic skin="light" />
          </div>
        </div>
      </div>
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
      videos: undefined,
      tvShows: undefined,
      talks: undefined,
      musicShow: undefined,
      moviesShow: undefined,
      newsShow: undefined,
      music: [],
      movies: [],
      news: [],
      loading: true,
      heroVideo: undefined,
    };
  },
  async fetch() {
    if (this.$store.state.shows.showsLoaded[this.$l2.code]) this.loadShows();
  },
  async mounted() {
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("shows")) {
        this.loadShows();
      }
    });
    if (!this.videos || this.videos.length === 0) {
      let videos = await this.getVideos({
        limit: 50,
        sort: "youtube_id",
        offset: this.randomOffset("allVideos", 50),
      });
      // Let's prioritize videos in tv shows or talks
      this.videos = this.random(videos)
        .sort((a, b) => (b.talk === a.talk ? 0 : b.tv_show ? 1 : -1))
        .sort((a, b) => (b.tv_show === a.tv_show ? 0 : b.tv_show ? 1 : -1));
    }
    await Helper.timeout(5000);
    this.loading = false; // Incase resources fail to load, at least show them
  },
  beforeDestroy() {
    // you may call unsubscribe to stop the subscription
    this.unsubscribe();
  },
  computed: {
    ...mapState("stats", ["stats"]),
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
    loadHeroVideo() {
      let randomVideos = this.random([
        ...(this.music || []),
        ...(this.movies || []),
        ...(this.news || []),
        ...(this.videos || []).filter((v) => v.tv_show || v.talk), // Let's not feature non-tv-show non-talk videos
      ]);
      this.heroVideo = randomVideos[0];
    },
    onVideoUnavailable() {
      this.videoUnavailable = true;
      this.videos = this.videos.filter(
        (v) => v.youtube_id !== this.heroVideo.youtube_id
      );
      this.loadHeroVideo();
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
        if (this.musicShow)
          this.music = await this.getVideos({
            limit: 25,
            tvShow: this.musicShow.id,
            sort: "youtube_id",
            offset: this.randomOffset("music", 25),
          });
        if (this.moviesShow)
          this.movies = await this.getVideos({
            limit: 25,
            tvShow: this.moviesShow.id,
            sort: "youtube_id",
            offset: this.randomOffset("movies", 25),
          });
      }
      if (this.talks) {
        this.newsShow = this.$store.state.shows.talks[this.$l2.code].find(
          (s) => s.title === "News"
        );
        if (this.newsShow)
          this.news = await this.getVideos({
            limit: 25,
            talk: this.newsShow.id,
            offset: this.randomOffset("news", 25),
          });
      }
      this.loading = false;
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
          }&${filter}&limit=${limit}&fields=l2,id,title,youtube_id,tv_show,talk,l2&offset=${offset}`
        );
        if (response.data.data && response.data.data.length > 0) {
          videos = Helper.uniqueByValue(response.data.data, "youtube_id");
        }
        return videos;
      } catch (err) {
        return [];
      }
    },
    randBase64(length) {
      var result = "";
      var characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      var charactersLength = characters.length;
      for (var i = 0; i < length; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * charactersLength)
        );
      }
      return result;
    },
  },
};
</script>

<style lang="scss" scoped>
.media-section {
  padding-bottom: 2rem;
  border-bottom: 1px solid #111;
}

.media-seaction-heading {
  margin-bottom: 2rem;
}

.zerotohero-wide {
  .shows {
    padding-left: 2rem;
    padding-right: 2rem;
  }
}

@media (max-width: 576px) {
  .show-list-wrapper {
    max-width: 423px;
    margin: 0 auto;
  }
}

::v-deep .synced-transcript {
  height: 5rem;
  overflow: hidden;
}

h3 {
  position: relative;
  font-size: 1.3rem;
}

.show-all {
  font-size: 1rem;
  margin-left: 1rem;
  display: inline-block;
  color: #28a745;
}
</style>