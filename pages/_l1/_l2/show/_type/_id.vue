<template>
  <div>
    <div v-if="featuredVideo">{{ featuredVideo.show }}</div>
    <div class="youtube-browse pb-5" style="min-height: 100vh">
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
            <!-- <Sale class="mb-4" v-if="$l2.code === 'zh'" /> -->
            <h3 v-if="show" class="mt-4">
              <span v-if="$adminMode" contenteditable="true" @blur="rename">
                {{ show.title }}
              </span>
              <i
                class="fas fa-check-circle text-success ml-2"
                v-if="titleUpdated"
              ></i>
            </h3>
            <p style="opacity: 0.6" class="mb-3" v-if="$adminMode && show">
              <span>
                Cover youtube_id:
                <span contenteditable="true" @blur="saveCover">
                  {{ show.youtube_id }}
                </span>
                <i
                  class="fas fa-check-circle text-success ml-2"
                  v-if="coverUpdated"
                ></i>
              </span>
              <b-button variant="small ml-2 btn-ghost-dark" @click="deleteShow">
                <i class="fa-solid fa-trash"></i>
                Delete Show
              </b-button>
            </p>
          </div>

          <div
            :class="{
              'loader text-center pt-5 pb-5': true,
              'd-none': hasEpisodes,
            }"
            style="flex: 1"
          >
            <Loader :sticky="true" message="Loading videos..." />
          </div>
          <div class="col-sm-12 mt-3 mb-5">
            <div class="episode-list-wrapper">
              <div class="episode-filter row mb-3" v-if="hasEpisodes">
                <div class="col-sm-12 mb-2">
                  <div class="d-flex">
                    <b-input-group class="flex-1 input-group-ghost-dark">
                      <b-form-input
                        v-model="keyword"
                        :lazy="true"
                        @compositionend.prevent.stop="() => false"
                        :placeholder="
                          episodeCount
                            ? $t(
                                'Search inside this collection ({num} videos)',
                                { num: episodeCount }
                              )
                            : $t('Filter videos...')
                        "
                        :class="{ 'input-ghost-dark': $skin === 'dark' }"
                      />
                    </b-input-group>
                    <router-link
                      :class="{
                        'btn ml-2': true,
                        'btn-ghost-dark-no-bg': $skin === 'dark',
                        'btn-light': $skin === 'light',
                      }"
                      style="opacity: 0.6; line-height: 1.7"
                      v-if="randomEpisodeYouTubeId"
                      :to="{
                        name: 'l1-l2-video-view-type',
                        params: {
                          type: 'youtube',
                          youtube_id: randomEpisodeYouTubeId,
                        },
                      }"
                    >
                      <i class="fas fa-random"></i>
                    </router-link>
                    <b-button-group style="opacity: 0.6">
                      <b-button
                        :class="{
                          'btn ml-1': true,
                          'btn-ghost-dark-no-bg': $skin === 'dark',
                          'btn-light': $skin === 'light',
                        }"
                        @click="view = view === 'grid' ? 'list' : 'grid'"
                      >
                        <i class="fas fa-th" v-if="view === 'grid'"></i>
                        <i class="fas fa-list" v-if="view === 'list'"></i>
                      </b-button>
                      <b-button
                        @click="cycleSort"
                        title="Sort by..."
                        :class="{
                          btn: true,
                          'btn-ghost-dark-no-bg': $skin === 'dark',
                          'btn-light': $skin === 'light',
                        }"
                      >
                        <i
                          class="fas fa-sort-alpha-down"
                          v-if="sort === 'title'"
                        ></i>
                        <i
                          class="fas fa-calendar-alt"
                          v-if="sort === '-date'"
                        ></i>
                        <i class="fas fa-eye" v-if="sort === '-views'"></i>
                      </b-button>
                    </b-button-group>
                  </div>
                </div>
              </div>
              <template v-if="hasEpisodes && !keyword">
                <LazyYouTubeVideoList
                  ref="youtubeVideoList"
                  :skin="$skin"
                  :videos="show.episodes"
                  :checkSubs="false"
                  :checkSaved="false"
                  :key="`videos-filtered-${this.keyword}-${this.sort}`"
                  :view="view"
                  :showBadges="false"
                  :showDate="showDate"
                  :showProgress="true"
                  :initialSort="sort"
                />
                <div v-observe-visibility="visibilityChanged"></div>
              </template>
              <div v-else-if="keyword">
                <MediaSearchResults :params="mediaSearchParams" class="mt-4" 
                  :key="`media-search-${searchResultKey}-${keyword}`"
                />
                <hr class="mb-5"/>
                <YouTubeSearchResults
                  :term="keyword"
                  :start="start"
                  :captions="captions"
                  :key="`youtube-search-${searchResultKey}-${keyword}`"
                  :long="long"
                  :infinite="true"
                  :showProgress="false"
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
import {
  randomArrayItem,
  unique,
  shuffle,
  uniqueByValue,
  LANGS_WITH_CONTENT,
} from "../../../../../lib/utils";
import { tify, sify } from "chinese-conv";

export default {
  props: {
    id: [Number, String],
    type: String, // "tv-show" or "talk"
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
      sort: "title", // "title", "-date", "-views"
      titleUpdated: false,
      tries: 0,
      view: "grid",
      musicOffset: 0,
      captions: "all",
      start: 0,
      long: false,
      searchResultKey: 0,
    };
  },
  computed: {
    hasEpisodes() {
      return this.show && this.show.episodes && this.show.episodes.length > 0;
    },
    mediaSearchParams() {
      const params = {
        "filter[title][contains]": this.keyword,
        "filter[l2]": this.$l2.id,
        sort: this.sort,
      };
      params[`filter[${this.collection}][eq]`] = this.show.id;
      return params;

    },
    randomEpisodeYouTubeId() {
      if (this.show.episodes?.length > 0) {
        let episode = randomArrayItem(this.show.episodes);
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
        return "Play Episode 1";
      } else {
        if (this.show.audiobook) return "Read Chapter 1";
        return "Play Latest Upload";
      }
    },
    title() {
      let what = "";
      if (this.type === "tv-show") what = `the TV show “${this.show.title}”`;
      else what = `the talk series “${this.show.title}”`;
      return `Learn ${this.$l2.name} with ${what} | Language Player`;
    },
  },
  watch: {
    async show() {
      this.sort = this.show?.sort
      this.episodeCount = await this.getEpisodeCount();
      this.musicOffset = Math.ceil(Math.random() * this.episodeCount);
      await this.getEpisodes({
        limit: this.perPage,
        offset: this.moreVideos,
        sort: this.sort,
      });
      this.show.episodes;
      this.loadFeaturedVideo();
    },
    async keyword() {
      let keywords = [this.keyword];
      if (this.$l2.han) {
        keywords.push(tify(this.keyword));
        keywords.push(sify(this.keyword));
      }
      keywords = unique(keywords);
      let videos = [];

      for (let keyword of keywords) {
        await this.getEpisodes({
          keyword,
          sort: this.sort,
        })
      }
    },
    async sort() {
      this.moreVideos = 0;
      this.videos = undefined;
      this.videos = await this.getEpisodes({
        limit: this.perPage,
        offset: this.moreVideos,
        sort: this.sort,
      });
    },
  },
  beforeDestroy() {
    if (this.unsubscribe) this.unsubscribe();
  },
  created() {
    if (this.id) {
      if (this.$store.state.shows.showsLoaded[this.$l2.code]) {
        this.getShowFromStore();
      }
      this.unsubscribe = this.$store.subscribe((mutation, state) => {
        if (mutation.type === "shows/LOAD_SHOWS") {
          if (!this.show) this.getShowFromStore();
        }
        if (mutation.type === "shows/REMOVE_SHOW") {
          this.$toast.success("Show removed.", { duration: 5000 });
          this.$router.go(-1);
        }
        if (mutation.type === "shows/UPDATE_SHOW") {
          this.$toast.success("Show updated.", { duration: 5000 });
        }
      });
    }
  },
  methods: {
    cycleSort() {
      let sorts = ["title", "-date", "-views"];
      let i = sorts.findIndex((sort) => sort === this.sort);
      this.sort = sorts[(i + 1) % sorts.length];
    },
    async deleteShow() {
      if (confirm("Are you sure you want to DELETE this show?")) {
        this.$store.dispatch("shows/remove", {
          l2: this.$l2,
          type: this.type === "tv-show" ? "tvShows" : "talks",
          show: this.show,
        });
      }
    },
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
          // shuffle mutates the original array!
          let videos = [...this.videos];
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
    async rename(e) {
      let title = e.target.innerText;
      if (this.show.title !== title) {
        this.$store.dispatch("shows/update", {
          l2: this.$l2,
          type: this.collection === "tv_show" ? "tvShows" : "talks",
          id: this.show.id,
          payload: { title },
        });
      }
    },
    async saveCover(e) {
      let youtube_id = e.target.innerText;
      if (this.show.youtube_id !== youtube_id) {
        this.$store.dispatch("shows/update", {
          l2: this.$l2,
          type: this.collection === "tv_show" ? "tvShows" : "talks",
          id: this.show.id,
          payload: { youtube_id },
        });
      }
    },
    async visibilityChanged(isVisible) {
      if (this.videos && isVisible && !this.keyword) {
        this.moreVideos = 1 + this.moreVideos + this.perPage;
        let newVideos = await this.getEpisodes({
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
    async getEpisodes({
      keyword,
      limit = this.perPage,
      offset = 0,
      sort = "title",
    } = {}) {
      // if (this.show.title === "Music" && this.episodeCount > 500)
      //   offset = offset + this.musicOffset;
      return await this.getEpisodesFromServer({ keyword, limit, offset, sort });
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
    async getEpisodesFromServer({ keyword, limit, offset, sort } = {}) {
      this.$store.dispatch("shows/getEpisodesFromServer", {
        l2: this.$l2,
        collection: this.collection === "tv_show" ? "tvShows" : "talks",
        showId: this.show.id,
        sort,
        forceRefresh: this.$adminMode,
        keyword,
        limit,
        offset,
        sort
      });
      return
    },
  },
};
</script>

<style lang="scss" scoped>
:deep(.synced-transcript) {
  height: 5rem;
  overflow: hidden;
}
</style>
