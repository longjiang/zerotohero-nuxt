<router>
  {
    path: '/:l1/:l2/all-media',
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
    <div class="container pb-5" style="padding-top: 3rem">
      <SocialHead
        :title="`Learn ${$l2.name} with Videos | ${$l2.name} Zero to Hero`"
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
            <div
              v-if="videos && movies && movies.length > 0"
              class="media-section"
            >
              <h3 class="media-seaction-heading">
                {{ $l2.name }} Movies
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
            <div
              v-if="videos && music && music.length > 0"
              class="media-section"
            >
              <h3 class="media-seaction-heading">
                {{ $l2.name }} Music Videos
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
            <div
              v-if="videos && tvShows && tvShows.length > 0"
              class="media-section"
            >
              <h3 class="media-seaction-heading">
                {{ $l2.name }} TV Shows
                <router-link :to="{ name: 'tv-shows' }" class="show-all">
                  More
                  <i class="fas fa-chevron-right ml-1"></i>
                </router-link>
              </h3>
              <ShowList
                :shows="
                  random(
                    tvShows.filter(
                      (s) => !['Movies', 'Music'].includes(s.title)
                    ),
                    6
                  )
                "
                type="tvShows"
                :key="`tv-shows`"
              />
            </div>
            <div
              v-if="videos && talks && talks.length > 0"
              class="media-section"
            >
              <h3 class="media-seaction-heading">
                {{ $l2.name }} YouTube
                <router-link :to="{ name: 'talks' }" class="show-all">
                  More
                  <i class="fas fa-chevron-right ml-1"></i>
                </router-link>
              </h3>
              <ShowList
                :shows="
                  random(
                    talks.filter(
                      (s) => !['News'].includes(s.title) && !s.audiobook
                    ),
                    6
                  )
                "
                type="talks"
                :key="`tv-shows`"
              />
              <div class="text-center mt-1"></div>
            </div>
            <div
              v-if="
                videos && talks && talks.length > 0 && audiobooks.length > 0
              "
              class="media-section"
            >
              <h3 class="media-seaction-heading">
                {{ $l2.name }} Audiobooks
                <router-link :to="{ name: 'audiobooks' }" class="show-all">
                  More
                  <i class="fas fa-chevron-right ml-1"></i>
                </router-link>
              </h3>
              <ShowList
                :shows="random(audiobooks, 6)"
                type="talks"
                :key="`tv-shows`"
              />
            </div>
            <div v-if="videos && news && news.length > 0" class="media-section">
              <h3 class="media-seaction-heading">
                {{ $l2.name }} News
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
            <div v-if="videos && videos.length > 0" class="media-section">
              <h3 class="media-seaction-heading">
                {{ $l2.name }} Videos
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
          </div>

          <client-only>
            <div v-if="$route.params.l1 && $route.params.l1 && $l1 && $l2">
              <div :class="{ 'pl-1 pr-1 pb-2': true }">
                <h4 class="text-center mb-4">
                  About the {{ $l2.name }} Language
                </h4>
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
                  {{ $l2.speakers ? $l2.speakers : "Not available" }}
                </p>
                <p>
                  <b>Speakers native to:</b>
                  <span
                    v-for="c in $l2.country"
                    :key="`lang-country-${c.alpha2Code}`"
                  >
                    <img
                      :src="`/vendor/flag-svgs/${c.alpha2Code}.svg`"
                      class="flag-icon"
                    />
                    {{ c.name }}
                  </span>
                </p>
              </div>
              <div :class="{ 'pl-1 pr-1 pb-2 pt-5': true }" v-if="$l2.han">
                <h4 class="text-center mb-4">Dialects of Chinese</h4>
                <Dialects skin="dark" />
              </div>
              <div :class="{ 'pl-1 pr-1 pb-2 pt-5': true }" v-if="$l2.han">
                <h4 class="text-center">56 Ethnic Groups of China</h4>
                <p class="text-center mb-4">(2010 Numbers)</p>
                <FiftySixEthnic skin="dark" />
              </div>
            </div>
            <LazyIdenticalLanguages class="mt-5 mb-5" routeName="all-media" />
          </client-only>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Helper from "@/lib/helper";
import Config from "@/lib/config";

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
    if (!this.videos || this.videos.length === 0)
      this.videos = await this.getVideos({ limit: 50, sort: "youtube_id" });
    this.loadHeroVideo();
    await Helper.timeout(3000);
    this.loading = false; // Incase resources fail to load, at least show them
  },
  beforeDestroy() {
    // you may call unsubscribe to stop the subscription
    this.unsubscribe();
  },
  computed: {
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
  methods: {
    loadHeroVideo() {
      this.heroVideo = this.random(this.videos)[0];
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
            limit: 100,
            tvShow: this.musicShow.id,
            sort: "youtube_id",
          });
        if (this.moviesShow)
          this.movies = await this.getVideos({
            limit: 100,
            tvShow: this.moviesShow.id,
            sort: "youtube_id",
          });
      }
      if (this.talks) {
        this.newsShow = this.$store.state.shows.talks[this.$l2.code].find(
          (s) => s.title === "News"
        );
        if (this.newsShow)
          this.news = await this.getVideos({
            limit: 100,
            talk: this.newsShow.id,
          });
      }
      this.loading = false;
    },
    random(array, max) {
      let shuffled = Helper.shuffle(array);
      return shuffled.slice(0, max);
    },
    async getVideos({
      limit = 10,
      tvShow = undefined,
      talk = undefined,
      sort = "-date",
    }) {
      try {
        let videos;
        let filter = "filter[tv_show][nnull]=1";
        if (tvShow) filter = `filter[tv_show][eq]=${tvShow}`;
        if (talk) filter = `filter[talk][eq]=${talk}`;

        let response = await this.$authios.get(
          `${Config.youtubeVideosTableName(
            this.$l2.id
          )}?sort=${sort}&filter[l2][eq]=${
            this.$l2.id
          }&${filter}&limit=${limit}&fields=id,title,youtube_id,tv_show,talk,l2`
        );
        if (response.data.data && response.data.data.length > 0)
          videos = response.data.data;
        if (!videos && !tvShow && !talk) {
          response = await this.$authios.get(
            `${Config.youtubeVideosTableName(
              this.$l2.id
            )}?sort=${sort}&filter[l2][eq]=${
              this.$l2.id
            }&limit=${limit}&fields=id,title,youtube_id,tv_show,talk,l2`
          );
          videos = response.data.data || [];
        }
        videos = Helper.uniqueByValue(videos, "youtube_id");
        if (!tvShow & !talk)
          videos = Helper.uniqueByValue(
            Helper.uniqueByValue(videos, "tv_show").concat(this.random(videos)),
            "youtube_id"
          );
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
  margin-bottom: 4rem;
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