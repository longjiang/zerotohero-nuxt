<router>
  {
    path: '/:l1/:l2/db-audit/:start?',
    props: true
  }
</router>
<template>
  <div class="main container-fluid mt-5">
    <div class="row">
      <div :class="{ 'col-sm-12 mb-5': true }">
        <h5 class="text-center mb-5">Audit Database</h5>
        <div
          :class="{
            'loader text-center mb-4': true,
            'd-none': videos,
          }"
          style="flex: 1"
        >
          <Loader :sticky="true" />
        </div>
        <div
          :class="{
            'text-center': true,
            'd-none': !videos || videos.length > 0,
          }"
        >
          No more videos.
        </div>
        <div class="text-center mb-3">
          <button
            class="btn btn-danger"
            @click="removeAllDupes"
            v-if="
              videosWithDupSubs.length > 0 || videosWithDupYouTubeIds.length > 0
            "
          >
            Remove All Dupes
          </button>
          <router-link
            v-if="start > 9"
            :to="`/${$l1.code}/${$l2.code}/db-audit/${
              Number(start) - perPage
            }`"
            class="btn btn-default"
          >
            <i class="fa fa-chevron-left"></i>
          </router-link>
          <span class="ml-3 mr-3">Page {{ start / perPage + 1 }}</span>
          <router-link
            v-if="videos && videos.length > 0"
            :to="`/${$l1.code}/${$l2.code}/db-audit/${
              Number(start) + perPage
            }`"
            class="btn btn-default"
          >
            <i class="fa fa-chevron-right"></i>
          </router-link>
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
                  max-height: 7rem;
                  overflow: scroll;
                "
              >
                {{ data.item.subs_l2 ? data.item.subs_l2.substr(0,100) : '' }}
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
              </div>
            </template>
          </b-table>
        </template>
        <div class="mt-4 text-center">
          <router-link
            v-if="start > 9"
            :to="`/${$l1.code}/${$l2.code}/db-audit/${
              Number(start) - perPage
            }`"
            class="btn btn-default"
          >
            <i class="fa fa-chevron-left"></i>
          </router-link>
          <span class="ml-3 mr-3">Page {{ start / perPage + 1 }}</span>
          <router-link
            v-if="videos && videos.length > 0"
            :to="`/${$l1.code}/${$l2.code}/db-audit/${
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
      perPage: 2000,
      fields: [
        "id",
        "youtube_id",
        "l2",
        "title",
        "channel_id",
        "topic",
        "level",
        "lesson",
        "tv_show",
        "talk",
        "subs_l2",
        "actions",
      ],
    };
  },
  async mounted() {
    this.videos = await this.getVideos();
  },
  methods: {
    async getVideos() {
      let limit = this.perPage;
      let response = await axios.get(
        `${Config.wiki}items/youtube_videos?sort=-id&limit=${limit}&offset=${
          this.start
        }&fields=id,youtube_id,l2,title,subs_l2,channel_id,topic,level,lesson,tv_show,talk&timestamp=${
          this.$adminMode ? Date.now() : 0
        }`
      );
      let videos = response.data.data || [];
      this.warnVideos(videos);
      return videos;
    },
    async removeAllDupes() {
      let videos = this.videos.filter((v) =>
        ["warning", "danger"].includes(v._rowVariant)
      );
      for (let video of videos) {
        await Helper.timeout(150);
        this.remove(video)
        console.log(`Removing video: ${video.title}`);
      }
    },
    async remove(video) {
      try {
        let response = await axios.delete(
          `${Config.wiki}items/youtube_videos/${video.id}`
        );
        if (response.data) {
          this.videos = this.videos.filter((v) => v !== video);
          warnVideos(this.videos);
        }
      } catch (err) {
        // Directus bug
      }
    },
    warnVideos(videos) {
      let seenYouTubeIds = [];
      let seenSubs = [];
      for (let video of videos) {
        if (seenYouTubeIds.includes(video.youtube_id)) {
          if (!video.lesson) video._rowVariant = "danger";
        } 
        else if (video.subs_l2 && seenSubs.includes(video.subs_l2)) {
          if (!video.lesson) video._rowVariant = "warning";
        } 
        else {
          seenYouTubeIds.push(video.youtube_id);
          seenSubs.push(video.subs_l2);
        }
      }
    },
    async csvAll() {
      let videos = this.videosWithJSONSubs;
      for (let video of videos) {
        await Helper.timeout(450);
        this.csv(video);
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
          console.log(
            `Converted to CSV. ${json.length / 1000}k -> ${
              csv.length / 1000
            }k, saved ${(
              ((json.length - csv.length) / json.length) *
              100
            ).toFixed(2)}%`
          );
        }
      } catch (err) {
        // Directus bug
      }
    },
    type(string) {
      return string && string.charAt(0) === "[" ? "json" : "csv";
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
    videosWithJSONSubs() {
      if (this.videos) {
        return this.videos.filter((v) => this.type(v.subs_l2) === "json");
      } else {
        return [];
      }
    },
    videosWithDupYouTubeIds() {
      return this.videos
        ? this.videos.filter((v) => v._rowVariant === "danger")
        : [];
    },
    videosWithDupSubs() {
      return this.videos
        ? this.videos.filter((v) => v._rowVariant === "warning")
        : [];
    },
  },
};
</script>
