<router>
  {
    path: '/:l1/:l2/show/:type/:id',
    props: true
  }
</router>
<template>
  <div class="youtube-browse container mt-5 mb-5 main">
    <SocialHead
      v-if="show"
      :title="`Learn ${$l2.name} with the TV Show ${show.title} | ${$l2.name} Zero to Hero`"
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
        <p v-if="count">({{ count }} Videos)</p>
      </div>
      <div class="col-sm-12 mb-5">
        <div class="youtube-video-list-wrapper">
          <div class="d-flex mb-5">
            <b-input-group class="flex-1">
              <b-form-input
                v-model="keyword"
                @compositionend.prevent.stop="() => false"
                placeholder="Filter by video title..."
              />
              <b-input-group-append>
                <b-button variant="primary">
                  <i class="fas fa-filter"></i>
                </b-button>
              </b-input-group-append>
            </b-input-group>
            <b-button-group>
              <b-button :variant="view === 'grid' ? 'primary' : secondary" class="ml-2" @click="view = 'grid'">
                <i class="fas fa-th"></i>
              </b-button>
              <b-button :variant="view === 'list' ? 'primary' : secondary"  @click="view = 'list'">
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
            <div class="heartbeat-loader"></div>
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
              :videos="filteredVideos"
              :checkSubs="false"
              ref="youtubeVideoList"
              :checkSaved="false"
              :key="`videos-filtered-${this.keyword}`"
            />
            <div v-observe-visibility="visibilityChanged"></div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Config from "@/lib/config";
import Helper from "@/lib/helper";
import axios from "axios";
import { tify } from "chinese-conv";

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
      view: 'grid'
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
  methods: {
    async visibilityChanged(isVisible) {
      if (this.videos && isVisible) {
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
    async getVideos({ limit = 500, offset = 0 } = {}) {
      let sort = this.show.title === "News" ? "-date" : "title";
      let response = await axios.get(
        `${Config.wiki}items/youtube_videos?filter[l2][eq]=${
          this.$l2.id
        }&filter[${this.collection}][eq]=${
          this.show.id
        }&fields=channel_id,id,lesson,level,title,topic,youtube_id,date,tv_show.*,talk.*&sort=${sort}&limit=${limit}&offset=${offset}&timestamp=${
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
    filteredVideos() {
      if (this.videos) {
        if (this.keyword) {
          let k = this.$l2.han ? tify(this.keyword) : this.keyword;
          k = k.toLowerCase();
          return this.videos.filter((v) => {
            let title = this.$l2.han ? tify(v.title) : v.title;
            title = title.toLowerCase();
            return title.includes(k);
          });
        } else {
          return this.videos;
        }
      }
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