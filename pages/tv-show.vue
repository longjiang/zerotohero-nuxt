<router>
  {
    path: '/:l1/:l2/tv-show/:id',
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
          {{ show.title }}
        </h3>
      </div>
      <div class="col-sm-12 mb-5">
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
            class="row"
            :videos="videos"
            :checkSubs="false"
            ref="youtubeVideoList"
            :checkSaved="false"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import Config from "@/lib/config";
import Helper from "@/lib/helper";
import axios from "axios";

export default {
  props: {
    id: String,
  },
  data() {
    return {
      show: undefined,
      videos: undefined,
    };
  },
  async fetch() {
    if (this.id) {
      this.show = await this.getShow(this.id, "tv_shows");
      this.videos = await this.getVideos();
    }
  },
  methods: {
    async getShow(id, type) {
      let response = await axios.get(`${Config.wiki}items/${type}/${id}`);
      if (response && response.data) {
        return response.data.data;
      }
    },
    async getVideos() {
      let response = await axios.get(
        `${Config.wiki}items/youtube_videos?filter[l2][eq]=${
          this.$l2.id
        }&filter[tv_show][eq]=${
          this.show.id
        }&fields=channel_id,id,lesson,level,title,topic,youtube_id,tv_show.*,talk.*${
          this.$adminMode ? ",subs_l2" : ""
        }&timestamp=${this.$adminMode ? Date.now() : 0}`
      );
      let videos = response.data.data || [];
      videos = Helper.uniqueByValue(videos, "youtube_id");
      videos =
        videos.sort((x, y) =>
          x.title.localeCompare(y.title, this.$l2.code, { numeric: true })
        ) || [];
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
  },
};
</script>

<style>
</style>