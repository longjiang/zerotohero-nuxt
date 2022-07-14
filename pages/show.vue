<router>
  {
    path: '/:l1/:l2/show/:type/:id',
    props: true,
    meta: {
      skin: 'dark'
    }
  }
</router>
<template>
  <div>
    <div v-if="featuredVideo">{{ featuredVideo.show }}</div>
    <VideoHero
      v-if="featuredVideo"
      :video="featuredVideo"
      :showEpisodes="false"
      :playButtonIcon="heroButtonIcon"
      :playButtonText="heroButtonText"
      :title="
        ['Music', 'News', 'Movies'].includes(show.title)
          ? featuredVideo.title
          : show.title
      "
      @videoUnavailable="onVideoUnavailable"
    />
    <div class="youtube-browse main-dark pb-5" style="min-height: 100vh">
      <div class="container">
        <SocialHead
          v-if="show"
          :title="title"
          :description="`Watch the full episode and study the ${
            $l2.code === 'zh' ? 'Pinyin' : $l2.name
          } subtitles.`"
          :image="`https://img.youtube.com/vi/${show.youtube_id}/hqdefault.jpg`"
        />
        <div class="row">
          <div class="col-sm-12 text-center">
            <div
              :class="{
                'loader text-center pt-5 pb-5': true,
                'd-none': videos,
              }"
              style="flex: 1"
            >
              <Loader :sticky="true" :message="`Loading videos...`" />
            </div>
            <!-- <Sale class="mb-4" v-if="$l2.code === 'zh'" /> -->
            <h3 v-if="show">
              <span v-if="$adminMode" contenteditable="true" @blur="saveTitle">
                {{ show.title }}
              </span>
              <i
                class="fas fa-check-circle text-success ml-2"
                v-if="titleUpdated"
              ></i>
            </h3>
            <p style="opacity: 0.6" class="mb-3">
              <span v-if="$adminMode && show">
                Cover youtube_id:
                <span contenteditable="true" @blur="saveCover">
                  {{ show.youtube_id }}
                </span>
                <i
                  class="fas fa-check-circle text-success ml-2"
                  v-if="coverUpdated"
                ></i>
              </span>
            </p>
          </div>

          <div class="col-sm-12 mb-5">
            <div class="youtube-video-list-wrapper">
              <div class="row mb-5" v-if="videos">
                <div class="col-sm-12 mb-2">
                  <div class="d-flex">
                    <b-input-group class="flex-1 input-group-ghost-dark">
                      <b-form-input
                        v-model="keyword"
                        :lazy="true"
                        @compositionend.prevent.stop="() => false"
                        :placeholder="episodeCount ? `Search inside this collection (${episodeCount} videos)` : 'Filter videos...'"
                        class="input-ghost-dark"
                      />
                    </b-input-group>
                    <router-link
                      class="btn btn-ghost-dark-no-bg ml-2"
                      style="opacity: 0.6; line-height: 1.7"
                      v-if="randomEpisodeYouTubeId"
                      :to="{
                        name: 'youtube-view',
                        params: { youtube_id: randomEpisodeYouTubeId },
                      }"
                    >
                      <i class="fas fa-random"></i>
                    </router-link>
                    <b-button-group style="opacity: 0.6">
                      <b-button
                        variant="ghost-dark-no-bg"
                        class="ml-1"
                        @click="view = view === 'grid' ? 'list' : 'grid'"
                      >
                        <i class="fas fa-th" v-if="view === 'grid'"></i>
                        <i class="fas fa-list" v-if="view === 'list'"></i>
                      </b-button>
                      <b-button
                        variant="ghost-dark-no-bg"
                        @click="sort = sort === 'title' ? '-date' : 'title'"
                        title="Sort by..."
                        class="ml-1"
                      >
                        <i
                          class="fas fa-sort-alpha-down"
                          v-if="sort === 'title'"
                        ></i>
                        <i
                          class="fas fa-calendar-alt"
                          v-if="sort === '-date'"
                        ></i>
                      </b-button>
                    </b-button-group>
                  </div>
                </div>
              </div>
              <template v-if="videos && videos.length > 0">
                <LazyYouTubeVideoList
                  ref="youtubeVideoList"
                  skin="dark"
                  :videos="videos"
                  :checkSubs="false"
                  :checkSaved="false"
                  :key="`videos-filtered-${this.keyword}`"
                  :view="view"
                  :showBadges="false"
                  :showDate="showDate"
                  :showProgress="true"
                  :showPlayButton="true"
                />
                <div v-observe-visibility="visibilityChanged"></div>
              </template>
              <div v-if="keyword">
                <MediaSearchResults :keyword="keyword" class="mt-4" />
                <YouTubeSearchResults
                  :term="keyword"
                  :start="start"
                  :captions="captions"
                  :key="searchResultKey"
                  :long="long"
                  :infinite="true"
                  :showProgress="false"
                  skin="dark"
                  ref="youtubeSearchResults"
                  :cloakVideosWithoutSubs="!$adminMode"
                />
              </div>
            </div>
            <LazyIdenticalLanguages class="mt-3" routeName="home" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Config from "@/lib/config";
import Helper from "@/lib/helper";
import { tify, sify } from "chinese-conv";

export default {
  props: {
    id: [Number, String],
    type: String, // "tv-show" or "talk"
  },
  computed: {
    $l1() {
      return this.$store.state.settings.l1;
    },
    $l2() {
      return this.$store.state.settings.l2;
    },
  },
  data() {
    return {
      collection: this.type === "tv-show" ? "tv_show" : "talk",
      episodeCount: undefined,
      coverUpdated: false,
      currentTime: 0,
      featuredVideo: undefined,
      heroUnavailable: false,
      keyword: "",
      moreVideos: 0,
      perPage: 96,
      show: undefined,
      showDiscover: false,
      sort: "title",
      titleUpdated: false,
      tries: 0,
      videos: undefined,
      view: "grid",
      musicOffset: 0,
    };
  },
  computed: {
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
    randomEpisodeYouTubeId() {
      if (this.videos?.length > 0) {
        let episode = Helper.randomArrayItem(this.videos);
        return episode.youtube_id;
      }
    },
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
    showDate() {
      return this.type === "talk";
    },
    heroButtonIcon() {
      if (this.show.audiobook) return "fas fa-book-open";
    },
    heroButtonText() {
      if (this.collection === "tv_show") {
        if (this.show.title === "Music") return "Play Music Video";
        if (this.show.title === "Movies") return "Play Film";
        return "Play Episode 1";
      } else {
        if (this.show.title === "News") return "Play Latest News";
        if (this.show.audiobook) return "Read Chapter 1";
        return "Play Latest Upload";
      }
    },
    title() {
      let what = "";
      if (this.type === "tv-show") what = `the TV show “${this.show.title}”`;
      else what = `the talk series “${this.show.title}”`;
      // But...
      if (["Music", "Movies", "News"].includes(this.show.title)) {
        what = this.show.title;
      }
      return `Learn ${this.$l2.name} with ${what} | Language Player`;
    },
  },
  watch: {
    async show() {
      this.sort =
        this.type === "talk" && !this.show.audiobook ? "-date" : "title";
      this.episodeCount = await this.getEpisodeCount();
      this.musicOffset = Math.ceil(Math.random() * this.episodeCount);
      this.videos = await this.getVideos({
        limit: this.perPage,
        offset: this.moreVideos,
        sort: this.sort,
      });
      this.loadFeaturedVideo();
    },
    async keyword() {
      let keywords = [this.keyword];
      if (this.$l2.han) {
        keywords.push(tify(this.keyword));
        keywords.push(sify(this.keyword));
      }
      keywords = Helper.unique(keywords);
      let videos = [];

      for (let keyword of keywords) {
        videos = videos.concat(
          await this.getVideos({
            keyword,
            sort: this.sort,
          })
        );
      }
      this.videos = videos;
    },
    async sort() {
      this.moreVideos = 0;
      if (this.videos) {
        this.videos = await this.getVideos({
          limit: this.perPage,
          offset: this.moreVideos,
          sort: this.sort,
        });
      }
    },
  },
  beforeDestroy() {
    if (this.unsubscribe) this.unsubscribe();
  },
  mounted() {
    if (this.id) {
      if (this.$store.state.shows.showsLoaded[this.$l2.code]) {
        this.getShowFromStore();
      }
      this.unsubscribe = this.$store.subscribe((mutation, state) => {
        if (mutation.type === "shows/LOAD_SHOWS") {
          if (!this.show) this.getShowFromStore();
        }
      });
    }
  },
  methods: {
    getShowFromStore() {
      let collection = this.collection === "tv_show" ? "tvShow" : "talk";
      let show = this.$store.getters[`shows/${collection}`]({
        l2: this.$l2,
        id: this.id,
      });
      this.show = show;
    },
    loadFeaturedVideo() {
      if (this.tries < 5) {
        if (this.videos && this.videos.length > 0) {
          // Helper.shuffle mutates the original array!
          let videos = [...this.videos];
          if (["Movies", "Music"].includes(this.show.title))
            videos = Helper.shuffle(videos);
          this.featuredVideo = videos[0];
        }
        this.tries++;
      } else {
        this.heroUnavailable = true;
      }
    },
    onVideoUnavailable(youtube_id) {
      if (this.featuredVideo.youtube_id === youtube_id) {
        this.loadFeaturedVideo();
      }
    },
    async saveTitle(e) {
      let newTitle = e.target.innerText;
      if (this.show.title !== newTitle) {
        try {
          let response = await this.$directus.patch(
            `items/${this.collection}s/${this.show.id}`,
            { title: newTitle },
            { contentType: "application/json" }
          );
          response = response.data;
          if (response && response.data) {
            this.show.title = newTitle;
            this.titleUpdated = true;
            await Helper.timeout(3000);
            this.titleUpdated = false;
          }
        } catch (err) {
          // Direcuts bug
        }
      }
    },
    async saveCover(e) {
      let newCover = e.target.innerText;
      if (this.show.title !== newCover) {
        try {
          let response = await this.$directus.patch(
            `items/${this.collection}s/${this.show.id}`,
            { youtube_id: newCover },
            { contentType: "application/json" }
          );
          response = response.data;
          if (response && response.data) {
            this.show.youtube_id = newCover;
            this.coverUpdated = true;
            await Helper.timeout(3000);
            this.coverUpdated = false;
          }
        } catch (err) {
          // Direcuts bug
        }
      }
    },
    async visibilityChanged(isVisible) {
      if (this.videos && isVisible && !this.keyword) {
        this.moreVideos = 1 + this.moreVideos + this.perPage;
        let newVideos = await this.getVideos({
          limit: this.perPage,
          offset: this.moreVideos,
          sort: this.sort,
        });
        this.videos = this.videos.concat(newVideos);
      }
    },
    async getShowFromServer(id, collection) {
      let response = await this.$directus.get(`items/${collection}s/${id}`);
      if (response && response.data) {
        return response.data.data;
      }
    },
    async getVideos({
      keyword,
      limit = this.perPage,
      offset = 0,
      sort = "title",
    } = {}) {
      if (this.show.title === "Music" && this.episodeCount > 500)
        offset = offset + this.musicOffset;
      if (
        !keyword &&
        this.show.episodes &&
        this.show.episodes.length >= offset + limit
      )
        return this.show.episodes.slice(offset, limit);
      else {
        return await this.getVideosFromServer({ keyword, limit, offset, sort });
      }
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
            this.collection,
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
          collection: this.collection === "tv_show" ? "tvShows" : "talks",
          showId: this.show.id,
          episodeCount,
        });
      return episodeCount;
    },
    async getVideosFromServer({ keyword, limit, offset, sort } = {}) {
      let keywordFilter = keyword ? `&filter[title][contains]=${keyword}` : "";
      let response = await this.$directus.get(
        `${this.$directus.youtubeVideosTableName(this.$l2.id)}?filter[l2][eq]=${
          this.$l2.id
        }&filter[${this.collection}][eq]=${
          this.show.id
        }${keywordFilter}&fields=id,title,l2,youtube_id,date,tv_show.*,talk.*&sort=${sort}&limit=${limit}&offset=${offset}&timestamp=${
          this.$adminMode ? Date.now() : 0
        }`
      );
      let videos = response.data.data || [];
      videos = Helper.uniqueByValue(videos, "youtube_id");
      if (sort === "title") {
        videos =
          videos.sort((x, y) =>
            (x.title || "").localeCompare(y.title, this.$l2.locales[0], {
              numeric: true,
            })
          ) || [];
      } else if (sort === "-date") {
        videos =
          videos.sort((y, x) =>
            x.date
              ? x.date.localeCompare(y.date, this.$l2.locales[0], {
                  numeric: true,
                })
              : -1
          ) || [];
      }
      this.$store.dispatch("shows/addEpisodesToShow", {
        l2: this.$l2,
        collection: this.collection === "tv_show" ? "tvShows" : "talks",
        showId: this.show.id,
        episodes: videos,
        sort,
      });
      return videos;
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep .synced-transcript {
  height: 5rem;
  overflow: hidden;
}
</style>