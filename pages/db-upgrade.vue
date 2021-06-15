<router>
  {
    path: '/:l1/:l2/db-upgrade/:start?',
    props: true
  }
</router>
<template>
  <div class="main container mt-5">
    <div class="row">
      <div :class="{ 'col-sm-12 mb-5': true }">
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
          <b-table small striped hover :fields="fields" :items="videos">
            <template #cell(actions)="data">
              <button
                class="btn-small bg-danger text-white"
                @click="remove(data.item)"
              >
                <i class="fas fa-trash"></i>
              </button>
            </template>
          </b-table>
        </template>
        <div class="mt-4 text-center">
          <router-link
            v-if="start > 9"
            :to="`/${$l1.code}/${$l2.code}/db-upgrade/${Number(start) - 12}`"
            class="btn btn-default"
          >
            <i class="fa fa-chevron-left"></i>
          </router-link>
          <span class="ml-3 mr-3">Page {{ start / 12 + 1 }}</span>
          <router-link
            v-if="videos && videos.length > 0"
            :to="`/${$l1.code}/${$l2.code}/db-upgrade/${Number(start) + 12}`"
            class="btn btn-default"
          >
            <i class="fa fa-chevron-right"></i>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Config from "@/lib/config";
import Helper from "@/lib/helper";
import YouTube from "@/lib/youtube";
import axios from "axios";

export default {
  props: {
    start: {
      default: 0,
    },
  },
  data() {
    return {
      videos: undefined,
    };
  },
  async fetch() {
    this.videos = await this.getVideos();
  },
  methods: {
    async getVideos() {
      let limit = 12;
      let response = await axios.get(
        `${Config.wiki}items/youtube_videos?sort=-id&limit=${limit}&offset=${
          this.start
        }&fields=id,youtube_id,l2,title,subs_l2,channel_id,topic,level,lesson&timestamp=${
          this.$adminMode ? Date.now() : 0
        }`
      );
      let videos = response.data.data || [];
      if (videos && this.$adminMode) {
        videos = await YouTube.checkShows(videos, this.$l2.id);
        for (let video of videos) {
          try {
            if (video.subs_l2) video.subs_l2 = JSON.parse(video.subs_l2);
          } catch (err) {}
        }
      }
      return videos;
    },
    async remove(video) {
      try {
        let response = await axios.delete(
          `${Config.wiki}items/youtube_videos/${video.id}`
        );
        if (response.data) {
          this.videos = this.videos.filter(v => v !== video)
        }
      } catch (err) {
        // Directus bug
      }
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
    fields() {
      if (this.videos && this.videos[0]) {
        return [
          "id",
          "youtube_id",
          "l2",
          "title",
          "channel_id",
          "topic",
          "level",
          "lesson",
          "subs_l2",
          "actions",
        ];
      }
    },
  },
};
</script>
