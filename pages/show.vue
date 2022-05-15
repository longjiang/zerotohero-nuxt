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
    <VideoHero
      v-if="featuredVideo"
      :video="featuredVideo"
      :showEpisodes="false"
      :title="['Music', 'News', 'Movies'].includes(show.title) ? featuredVideo.title : show.title"
      @videoUnavailable="onVideoUnavailable"
    />
    <div
      class="youtube-browse main-dark pb-5"
      style="min-height: 100vh; padding-top: 5rem"
    >
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
          <div class="col-sm-12 mb-3 text-center">
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
            <p style="opacity: 0.6">
              <span v-if="count">{{ count }} Episodes</span>
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
              <div class="row mb-5">
                <div class="col-sm-12 col-md-8 mb-2">
                  <div class="d-flex">
                    <b-input-group class="flex-1 input-group-ghost-dark">
                      <b-form-input
                        v-model="keyword"
                        :lazy="true"
                        @compositionend.prevent.stop="() => false"
                        placeholder="Filter by video title..."
                        class="input-ghost-dark"
                      />
                      <b-input-group-append>
                        <b-button variant="ghost-dark">
                          <i class="fas fa-filter"></i>
                        </b-button>
                      </b-input-group-append>
                    </b-input-group>
                    <b-button-group>
                      <b-button
                        :variant="
                          view === 'grid' ? 'ghost-dark' : 'ghost-dark-outline'
                        "
                        class="ml-2"
                        @click="view = 'grid'"
                      >
                        <i class="fas fa-th"></i>
                      </b-button>
                      <b-button
                        :variant="
                          view === 'list' ? 'ghost-dark' : 'ghost-dark-outline'
                        "
                        @click="view = 'list'"
                        style="border-left: none"
                      >
                        <i class="fas fa-list"></i>
                      </b-button>
                    </b-button-group>
                  </div>
                </div>
                <div class="col-sm-12 col-md-4 mb-2">
                  <b-form-select
                    v-model="sort"
                    :options="sortOptions"
                    class="select-ghost-dark"
                  ></b-form-select>
                </div>
              </div>
              <div
                :class="{
                  'loader text-center mb-4': true,
                  'd-none': videos,
                }"
                style="flex: 1"
              >
                <Loader :sticky="true" message="Loading videos..." />
              </div>
              <div
                :class="{
                  'text-center': true,
                  'd-none': !videos || videos.length > 0,
                }"
              >
                No more videos.
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
import axios from "axios";
import { tify, sify } from "chinese-conv";

export default {
  props: {
    id: String,
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
      tries: 0,
      moreVideos: 0,
      show: undefined,
      videos: undefined,
      perPage: 96,
      count: undefined,
      keyword: "",
      view: "grid",
      titleUpdated: false,
      coverUpdated: false,
      randomEpisode: undefined,
      currentTime: 0,
      showDiscover: false,
      featuredVideo: undefined,
      heroUnavailable: false,
      sortOptions: [
        {
          value: "title",
          text: "Sort by Title",
        },
        {
          value: "-date",
          text: "Sort by Date",
        },
      ],
      sort: "title",
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
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
    showDate() {
      return this.type === "talk";
    },
    title() {
      let what = "";
      if (this.type === "tv-show") what = `the TV show “${this.show.title}”`;
      else what = `the talk series “${this.show.title}”`;
      // But...
      if (["Music", "Movies", "News"].includes(this.show.title)) {
        what = this.show.title;
      }
      return `Learn ${this.$l2.name} with ${what} | ${this.$l2.name} Zero to Hero`;
    },
  },
  watch: {
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
        });
      }
    },
  },
  async mounted() {
    if (this.id) {
      this.show = await this.getShow(this.id, this.collection);
      if (this.show) {
        this.sort =
          this.type === "talk" && !this.show.audiobook ? "-date" : "title";
        this.videos = await this.getVideos({
          limit: this.perPage,
          offset: this.moreVideos,
        });
        this.loadFeaturedVideo();
      }
    }
  },
  methods: {
    loadFeaturedVideo() {
      if (this.tries < 5) {
        if (this.videos && this.videos.length > 0)
          this.featuredVideo = this.random(this.videos)[0];
        this.tries++;
      } else {
        this.heroUnavailable = true
      }
    },
    onVideoUnavailable() {
      this.loadFeaturedVideo();
    },
    random(array, max) {
      let shuffled = Helper.shuffle(array);
      return shuffled.slice(0, max);
    },
    async saveTitle(e) {
      let newTitle = e.target.innerText;
      if (this.show.title !== newTitle) {
        try {
          let response = await axios.patch(
            `${Config.wiki}items/${this.collection}s/${this.show.id}`,
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
          let response = await axios.patch(
            `${Config.wiki}items/${this.collection}s/${this.show.id}`,
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
        });
        this.videos = this.videos.concat(newVideos);
      }
    },
    async getShow(id, collection) {
      let response = await axios.get(
        `${Config.wiki}items/${collection}s/${id}`
      );
      if (response && response.data) {
        return response.data.data;
      }
    },
    async getVideos({ keyword, limit = 500, offset = 0 } = {}) {
      let sort = this.sort;
      let keywordFilter = keyword ? `&filter[title][contains]=${keyword}` : "";
      let response = await axios.get(
        `${Config.youtubeVideosTableName(this.$l2.id)}?filter[l2][eq]=${
          this.$l2.id
        }&filter[${this.collection}][eq]=${
          this.show.id
        }${keywordFilter}&fields=channel_id,id,lesson,level,title,topic,youtube_id,date,tv_show.*,talk.*&sort=${sort}&limit=${limit}&offset=${offset}&timestamp=${
          this.$adminMode ? Date.now() : 0
        }`
      );
      let videos = response.data.data || [];
      videos = Helper.uniqueByValue(videos, "youtube_id");
      if (this.sort === "title") {
        videos =
          videos.sort((x, y) =>
            (x.title || "").localeCompare(y.title, this.$l2.locales[0], {
              numeric: true,
            })
          ) || [];
      } else if (this.sort === "-date") {
        videos =
          videos.sort((y, x) =>
            x.date
              ? x.date.localeCompare(y.date, this.$l2.locales[0], {
                  numeric: true,
                })
              : -1
          ) || [];
      }
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