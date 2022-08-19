<router>
  {
    path: '/:l1/:l2/explore-media',
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
        :title="`Learn ${$l2.name} with Videos | Language Player`"
        :description="`Learn ${$l2.name} with Videos`"
        :image="'/img/tv-shows.jpg'"
      />
      <div class="row mt-4">
        <div class="col-sm-12">
          <!-- <Sale class="mt-5 mb-5" v-if="$l2.code === 'zh'" /> -->
          <!-- <SimpleSearch placeholder="Search" ref="searchLibrary" skin="dark" class="mt-4 mb-5" style="flex: 1" :action="
            (url) => {
              this.$router.push({
                path: `/${$l1.code}/${$l2.code
                  }/youtube/search/${encodeURIComponent(
                    url
                  )}`,
              });
            }
          " /> -->
          <div :class="{ 'media-section': true, 'd-none': !hasWatchHistory }">
            <h3 class="media-seaction-heading">
              Continue Watching
              <router-link :to="{ name: 'watch-history' }" class="show-all">
                More
                <i class="fas fa-chevron-right ml-1"></i>
              </router-link>
            </h3>
            <WatchHistoryComp
              :l2="$l2"
              ref="watch-history"
              skin="dark"
              :class="{ 'mt-3': true, 'd-none': !hasWatchHistory }"
              :showDate="false"
              :showClear="false"
              :limit="12"
              :showLanguage="false"
              :showRemove="false"
              :showPlayButton="false"
              @hasWatchHistory="onHasWatchHistory"
            />
          </div>

          <div v-if="talks && talks.length > 0" class="media-section">
            <h3 class="media-seaction-heading">
              YouTube
              <router-link :to="{ name: 'talks' }" class="show-all">
                More
                <i class="fas fa-chevron-right ml-1"></i>
              </router-link>
            </h3>
            <ShowList
              :shows="
                talks
                  .filter((s) => !['News'].includes(s.title) && !s.audiobook)
                  .slice(0, 12)
              "
              type="talks"
              :key="`tv-shows`"
            />
            <div class="text-center mt-1"></div>
          </div>

          <div
            :class="{
              'loader text-center': true,
              'd-none': showsLoaded,
            }"
            style="margin: 7rem 0 15rem 0"
          >
            <Loader :sticky="true" message="Loading videos in our library..." />
          </div>
          <div v-if="tvShows && tvShows.length > 0" class="media-section">
            <h3 class="media-seaction-heading">
              TV Shows
              <router-link :to="{ name: 'tv-shows' }" class="show-all">
                More
                <i class="fas fa-chevron-right ml-1"></i>
              </router-link>
            </h3>
            <ShowList
              :shows="
                tvShows
                  .filter((s) => !['Movies', 'Music'].includes(s.title))
                  .slice(0, 12)
              "
              type="tvShows"
              :key="`tv-shows`"
            />
          </div>

          <div v-if="music && music.length > 0" class="media-section">
            <h3 class="media-seaction-heading">
              Music
              <router-link
                :to="{
                  name: 'show',
                  params: { type: 'tv-show', id: musicShow.id },
                }"
                class="show-all"
              >
                More
                <i class="fas fa-chevron-right ml-1"></i>
              </router-link>
            </h3>
            <LazyYouTubeVideoList
              :videos="random(music).slice(0, 12)"
              :showAdminToolsInAdminMode="false"
              skin="dark"
            />
          </div>

          <div class="media-sections" v-if="!loading">
            <div v-if="movies && movies.length > 0" class="media-section">
              <h3 class="media-seaction-heading">
                Movies
                <router-link
                  :to="{
                    name: 'show',
                    params: { type: 'tv-show', id: moviesShow.id },
                  }"
                  class="show-all"
                >
                  More
                  <i class="fas fa-chevron-right ml-1"></i>
                </router-link>
              </h3>
              <LazyYouTubeVideoList
                :videos="random(movies).slice(0, 12)"
                :showAdminToolsInAdminMode="false"
                skin="dark"
              />
            </div>

            <div v-if="news && news.length > 0" class="media-section">
              <h3 class="media-seaction-heading">
                News
                <router-link
                  :to="{
                    name: 'show',
                    params: { type: 'talk', id: newsShow.id },
                  }"
                  class="show-all"
                >
                  More
                  <i class="fas fa-chevron-right ml-1"></i>
                </router-link>
              </h3>
              <LazyYouTubeVideoList
                :videos="random(news).slice(0, 12)"
                :showAdminToolsInAdminMode="false"
                skin="dark"
              />
            </div>
          </div>
          <div
            v-if="
              talks && talks.length > 0 && audiobooks && audiobooks.length > 0
            "
            class="media-section"
          >
            <h3 class="media-seaction-heading">
              Audiobooks
              <router-link :to="{ name: 'audiobooks' }" class="show-all">
                More
                <i class="fas fa-chevron-right ml-1"></i>
              </router-link>
            </h3>
            <ShowList
              :shows="random(audiobooks, 12)"
              type="talks"
              :key="`tv-shows`"
            />
          </div>

          <div v-if="videos && videos.length > 0" class="media-section">
            <h3 class="media-seaction-heading">
              Newly Added
              <router-link :to="{ name: 'youtube-browse' }" class="show-all">
                More
                <i class="fas fa-chevron-right ml-1"></i>
              </router-link>
            </h3>
            <LazyYouTubeVideoList
              :videos="videos.slice(0, 12)"
              :showAdminToolsInAdminMode="false"
              skin="dark"
            />
          </div>

          <client-only>
            <Nav
              :l1="$l1"
              :l2="$l2"
              variant="page"
              class="youtube-browse-nav mt-5"
              :showOnly="['Media']"
            />
          </client-only>
          <client-only>
            <LazyIdenticalLanguages
              class="mt-5 mb-5"
              routeName="explore-media"
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
import { mapState } from "vuex";
import { languageLevels, LANGS_WITH_LEVELS } from "@/lib/utils";

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
      hasWatchHistory: false,
      showsLoaded: false,
      term: undefined,
      LANGS_WITH_LEVELS,
      all: false, // If false, show users the category selection; if true, show recent videos, tv shows, youtube videos, etc.
    };
  },
  async mounted() {
    if (this.$store.state.shows.showsLoaded[this.$l2.code]) this.loadShows();
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
    ...mapState("shows", ["categories"]),
    ...mapState("settings", ["preferredCategories"]),
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
    levels() {
      let langLevels = languageLevels(this.$l2);
      return [1, 2, 3, 4, 5, 6, 7].map((l) => langLevels[l]);
    },
  },
  watch: {
    loading() {
      if (this.loading === false) this.loadHeroVideo();
    },
  },
  methods: {
    onHasWatchHistory() {
      this.hasWatchHistory = true;
    },
    loadHeroVideo() {
      let randomVideos = [
        ...(this.movies || []),
        ...(this.music || []),
        ...(this.videos || []).filter((v) => v.tv_show),
      ];
      if (randomVideos.length < 50) {
        randomVideos = randomVideos.concat(this.news || []);
      }
      if (randomVideos.length < 50) {
        randomVideos = randomVideos.concat(
          (this.videos || []).filter((v) => v.talk)
        ); // Let's not feature non-tv-show non-talk videos
      }
      randomVideos = this.random(randomVideos);
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
      if (this.showsLoaded) return;
      else this.showsLoaded = true;

      let tvShows = this.$store.state.shows.tvShows[this.$l2.code];
      let talks = this.$store.state.shows.talks[this.$l2.code];
      if (tvShows) {
        this.tvShows =
          tvShows
            .sort((x, y) => y.avg_views - x.avg_views)
            .sort((x, y) => {
              x = this.preferredCategories.includes(String(x.category))
              y = this.preferredCategories.includes(String(y.category))
              return x === y
                ? 0
                : x
                ? -1
                : 1;
            }) || [];
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
      if (talks) {
        this.talks =
          talks
            .sort((x, y) => y.avg_views - x.avg_views)
            .sort((x, y) => {
              x = this.preferredCategories.includes(String(x.category))
              y = this.preferredCategories.includes(String(y.category))
              return x === y
                ? 0
                : x
                ? -1
                : 1;
            }) || [];
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
          let random = this.dayOfTheYear() / 366;
          let offset = Math.floor(random * (stats - max));
          return offset;
        }
      }
      return 0;
    },
    // https://stackoverflow.com/questions/8619879/javascript-calculate-the-day-of-the-year-1-366
    dayOfTheYear() {
      var now = new Date();
      var start = new Date(now.getFullYear(), 0, 0);
      var diff = now - start;
      var oneDay = 1000 * 60 * 60 * 24;
      var day = Math.floor(diff / oneDay);
      return day;
    },
    random(array, max) {
      let random = this.dayOfTheYear() / 366;
      let offset = Math.min(
        Math.floor(array.length * random),
        array.length - max
      );
      let sliced = array.slice(offset, offset + max || 12);
      return sliced;
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
      let filter = "";
      if (tvShow) filter = `filter[tv_show][eq]=${tvShow}`;
      if (talk) filter = `filter[talk][eq]=${talk}`;
      // First find videos associated with a particular tv show, or talk
      let videos = await this.$directus.getVideos({
        l2Id: this.$l2.id,
        query: `sort=${sort}&${filter}&limit=${limit}&fields=l2,id,title,youtube_id,tv_show,talk,l2&offset=${offset}`,
      });
      if (videos?.length > 0) {
        videos = Helper.uniqueByValue(videos, "youtube_id");
      }
      return videos;
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
  // border-bottom: 1px solid #111;
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