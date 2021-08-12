<router>
  {
    path: '/:l1/:l2/show/:type/:id',
    props: true
  }
</router>
<template>
  <div class="main main-dark">
    <div class="youtube-browse container pt-5 pb-5">
      <SocialHead
        v-if="show"
        :title="`Learn ${$l2.name} with the ${
          this.type === 'tv-show' ? 'TV show' : 'talk series'
        } “${show.title}” | ${$l2.name} Zero to Hero`"
        :description="`Watch the full episode and study the ${
          $l2.code === 'zh' ? 'Pinyin' : $l2.name
        } subtitles.`"
        :image="`https://img.youtube.com/vi/${show.youtube_id}/hqdefault.jpg`"
      />
      <div class="row">
        <div class="col-sm-12 mb-4 text-center">
          <h3 v-if="show">
            <Annotate :phonetics="false" :buttons="true">
              <span>{{ show.title }}</span>
            </Annotate>
          </h3>
          <p v-if="count" style="opacity: 0.6">{{ count }} Episodes</p>
        </div>
        <div class="col-sm-12 mb-5">
          <div class="youtube-video-list-wrapper">
            <div class="d-flex mb-5">
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
            <div
              :class="{
                'loader text-center mb-4': true,
                'd-none': videos,
              }"
              style="flex: 1"
            >
              <Loader :sticky="true" message="Loading episodes..." />
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
              <YouTubeVideoList
                ref="youtubeVideoList"
                skin="dark"
                :videos="videos"
                :checkSubs="false"
                :checkSaved="false"
                :key="`videos-filtered-${this.keyword}`"
                :view="view"
                :showBadges="false"
                :showDate="showDate"
              />
              <div v-observe-visibility="visibilityChanged"></div>
            </template>
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
    type: String,
  },
  data() {
    return {
      collection: this.type === "tv-show" ? "tv_show" : "talk",
      moreVideos: 0,
      show: undefined,
      videos: undefined,
      perPage: 96,
      count: undefined,
      keyword: "",
      view: "grid",
    };
  },
  async fetch() {
    if (this.id) {
      this.show = await this.getShow(this.id, this.collection);
      this.videos = await this.getVideos({
        limit: this.perPage,
        offset: this.moreVideos,
      });
    }
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
  },
  methods: {
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
      let sort = this.show.title === "News" ? "-date" : "title";
      let keywordFilter = keyword ? `&filter[title][contains]=${keyword}` : "";
      let response = await axios.get(
        `${Config.wiki}items/youtube_videos?filter[l2][eq]=${
          this.$l2.id
        }&filter[${this.collection}][eq]=${
          this.show.id
        }${keywordFilter}&fields=channel_id,id,lesson,level,title,topic,youtube_id,date,tv_show.*,talk.*&sort=${sort}&limit=${limit}&offset=${offset}&timestamp=${
          this.$adminMode ? Date.now() : 0
        }&meta=filter_count`
      );
      let videos = response.data.data || [];
      this.count = response.data.meta.filter_count;
      videos = Helper.uniqueByValue(videos, "youtube_id");
      if (this.show.title !== "News") {
        videos =
          videos.sort((x, y) =>
            x.title.localeCompare(y.title, this.$l2.code, { numeric: true })
          ) || [];
      } else {
        videos =
          videos.sort((y, x) =>
            x.date
              ? x.date.localeCompare(y.date, this.$l2.code, { numeric: true })
              : -1
          ) || [];
      }
      return videos;
    },
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
  },
};
</script>

<style lang="scss" scoped>
@media (max-width: 576px) {
  .youtube-video-list-wrapper {
    max-width: 423px;
    margin: 0 auto;
  }
}
</style>