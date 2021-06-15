<router>
  {
    path: '/:l1/:l2/db-upgrade/:start?',
    props: true
  }
</router>
<template>
  <div class="main container-fluid mt-5">
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
          <b-table
            small
            striped
            hover
            :fields="fields"
            :items="videos"
            responsive
          >
            <template #cell(title)="data">
              <router-link
                :to="{
                  name: 'youtube-view',
                  params: { youtube_id: data.item.youtube_id },
                }"
              >
                {{ data.item.title }}
              </router-link>
            </template>
            <template #cell(subs_l2)="data">
              <div
                class="text-secondary"
                style="
                  font-family: monospace;
                  font-size: 0.8em;
                  width: 40rem;
                  height: 7rem;
                  overflow: scroll;
                "
              >
                {{ data.item.subs_l2 }}
              </div>
            </template>
            <template #cell(actions)="data">
              <div style="min-width: 5rem">
                <button
                  class="btn-small bg-danger text-white"
                  @click="remove(data.item)"
                >
                  <i class="fas fa-trash"></i>
                </button>
                <button
                  class="btn-small bg-success text-white"
                  v-if="type(data.item.subs_l2) === 'json'"
                  @click="csv(data.item)"
                >
                  CSV
                </button>
              </div>
            </template>
          </b-table>
        </template>
        <div class="mt-4 text-center">
          <router-link
            v-if="start > 9"
            :to="`/${$l1.code}/${$l2.code}/db-upgrade/${
              Number(start) - perPage
            }`"
            class="btn btn-default"
          >
            <i class="fa fa-chevron-left"></i>
          </router-link>
          <span class="ml-3 mr-3">Page {{ start / perPage + 1 }}</span>
          <router-link
            v-if="videos && videos.length > 0"
            :to="`/${$l1.code}/${$l2.code}/db-upgrade/${
              Number(start) + perPage
            }`"
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
import Papa from "papaparse";

export default {
  props: {
    start: {
      default: 0,
    },
  },
  data() {
    return {
      videos: undefined,
      perPage: 100,
      seenYouTubeIds: [],
      seenSubs: [],
    };
  },
  async fetch() {
    this.videos = await this.getVideos();
  },
  methods: {
    async getVideos() {
      this.seenYouTubeIds = [];
      this.seenSubs = [];
      let limit = this.perPage;
      let response = await axios.get(
        `${Config.wiki}items/youtube_videos?sort=-id&limit=${limit}&offset=${
          this.start
        }&fields=id,youtube_id,l2,title,subs_l2,channel_id,topic,level,lesson&timestamp=${
          this.$adminMode ? Date.now() : 0
        }`
      );
      let videos = response.data.data || [];
      for (let video of videos) {
        if (this.seenYouTubeIds.includes(video.youtube_id)) {
          video._rowVariant = "danger";
        } else if (this.seenSubs.includes(video.subs_l2)) {
          videos.filter(v => v.subs_l2 === video.subs_l2).map(v => {
            v._rowVariant = v._rowVariant === 'danger' ? v._rowVariant : "warning"
            return v
          })
        } else {
          this.seenYouTubeIds.push(video.youtube_id);
          this.seenSubs.push(video.subs_l2);
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
          this.videos = this.videos.filter((v) => v !== video);
        }
      } catch (err) {
        // Directus bug
      }
    },
    async csv(video) {
      let json = video.subs_l2;
      let subs = JSON.parse(json);
      let csv = Papa.unparse(
        subs.map((item) => {
          return { starttime: item.starttime, line: item.line };
        })
      );
      console.log(`Saved ${((json.length - csv.length) / json.length) * 100}%`);
      try {
        let response = await axios.patch(
          `${Config.wiki}items/youtube_videos/${video.id}`,
          {
            subs_l2: csv,
          }
        );
        if (response && response.data) {
          video.id = response.data.data.id;
          video.subs_l2 = response.data.data.subs_l2;
          // video.subs_l2 = response.data.subs_l2
        }
      } catch (err) {
        // Directus bug
      }
    },
    type(string) {
      return string.charAt(0) === "[" ? "json" : "csv";
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
