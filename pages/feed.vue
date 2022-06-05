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
  <div class="main-dark">
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
        <div class="col-sm-12">
          <div
            :class="{
              'loader text-center': true,
              'd-none': videos && !loading,
            }"
            style="margin: 7rem 0 15rem 0"
          >
            <Loader :sticky="true" message="Loading videos in our library..." />
          </div>

          <div class="media-sections" v-if="!loading">
            <div v-if="videos && videos.length > 0" class="media-section">
              <LazyYouTubeVideoList
                :videos="videos.slice(0, 12)"
                :showAdminToolsInAdminMode="false"
                :showDate="true"
                :showBadges="true"
                :showPlayButton="true"
                skin="dark"
              />
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
        ...(this.videos || []).filter((v) => v.tv_show || v.talk), // Let's not feature non-tv-show non-talk videos
      ]);
      this.heroVideo = randomVideos[0];
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
          }&${filter}&limit=${limit}&fields=l2,id,title,youtube_id,tv_show,talk,date,l2&offset=${offset}`
        );
        if (response.data.data && response.data.data.length > 0) {
          videos = Helper.uniqueByValue(response.data.data, "youtube_id");
        }
        for (let video of videos) {
          if (this.tvShows) {
            if (video.tv_show) {
              video.tv_show = this.tvShows.find(s => s.id === video.tv_show)
            }
            if (video.talk) {
              video.talk = this.talks.find(s => s.id === video.talk)
            }
          }
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