<router>
  {
    path: '/:l1/:l2/recover-subs/:start?',
    props: true
  }
</router>
<template>
  <div class="main container-fluid mt-5">
    <div class="row">
      <div :class="{ 'col-sm-12 mb-5': true }">
        <div class="mb-5 text-center">
          Recover subtitles that have been truncated during database upgrade
          (2021-06-18)
        </div>
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
            class="btn btn-success"
            @click="recoverAll"
            v-if="unRecoveredVideos.length > 0"
          >
            Recover All
          </button>
          <button
            class="btn btn-success"
            @click="csvAll"
            v-if="videosWithJSONSubs.length > 0"
          >
            Convert All Subs to CSV
          </button>
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
          <b-progress
            class="mt-3"
            variant="success"
            v-if="unRecoveredVideos.length > 0"
            :value="videos.length - unRecoveredVideos.length"
            :max="videos.length"
            animated
          ></b-progress>
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
                  name: 'video-view',
                  params: { type: 'youtube', youtube_id: data.item.youtube_id },
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
                  overflow: auto;
                "
              >
                {{ data.item.subs_l2 ? data.item.subs_l2.substr(0, 100) : "" }}
              </div>
            </template>
            <template #cell(actions)="data">
              <div style="min-width: 5rem">
                <!-- <button
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
                </button> -->
                <button
                  class="btn-small bg-success text-white"
                  v-if="!data.item.recovered"
                  @click="recover(data.item)"
                >
                  Recover
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
import Papa from "papaparse";
import Vue from "vue";

export default {
  props: {
    start: {
      default: 0,
    },
  },
  data() {
    return {
      backupVideos: undefined,
      videos: undefined,
      perPage: 1000,
      fields: [
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
      ],
    };
  },
  computed: {
  },
  async mounted() {
    this.videos = await this.getVideos();
  },
  methods: {
    async recoverAll() {
      let videos = this.unRecoveredVideos;
      let response = await this.$directus.get(
        `https://db.zerotohero.ca/_/items/youtube_videos?limit=-1&filter[id][in]=${videos
          .map((v) => v.id)
          .join(",")}`
      );
      if (response && response.data) this.backupVideos = response.data.data;
      for (let video of videos) {
        this.recover(video);
      }
    },
    async recover(video) {
      let truncatedCSV = video.subs_l2;
      let backupVideo = this.backupVideos.find((v) => v.id === video.id);
      if (backupVideo) {
        if (backupVideo.youtube_id === video.youtube_id) {
          let recovered = backupVideo;
          let recoveredSubs = JSON.parse(recovered.subs_l2);
          recoveredSubs = recoveredSubs.map((l) => {
            return { starttime: l.starttime, line: l.line };
          });
          let recoveredCSV = Papa.unparse(recoveredSubs);
          let patchResponse = await this.$directus.patch(
            `${this.$directus.youtubeVideosTableName(this.$l2.id)}/${
              video.id
            }&fields=id`,
            { subs_l2: recoveredCSV }
          );
          if (patchResponse && patchResponse.data) {
            console.log(
              `Recovered: (${truncatedCSV.length / 1000}k -> ${
                recoveredCSV.length / 1000
              }k) ${video.title}`
            );
            Vue.set(video, "recovered", true);
          }
        } else {
          Vue.set(video, "recovered", true);
          console.log(`YouTube ID mismatch: ${video.title}`);
        }
      }
    },
    async getVideos() {
      let limit = this.perPage;
      let response = await this.$directus.get(
        `${this.$directus.youtubeVideosTableName(
          this.$l2.id
        )}?sort=-id&limit=${limit}&offset=${
          this.start
        }&fields=id,youtube_id,l2,title,channel_id,topic,level,lesson,subs_l2&timestamp=${
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
        this.remove(video);
        console.log(`Removing video: ${video.title}`);
      }
    },
    async remove(video) {
      try {
        let response = await this.$directus.delete(
          `${this.$directus.youtubeVideosTableName(this.$l2.id)}/${video.id}`
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
        // if (!video.subs_l2) {
        //   video._rowVariant = "danger";
        // }
        if (!video.subs_l2 || (video.subs_l2 && video.subs_l2.length !== 2000))
          video.recovered = true;
        if (seenYouTubeIds.includes(video.youtube_id)) {
          if (!video.lesson) video._rowVariant = "danger";
        } else if (video.subs_l2 && seenSubs.includes(video.subs_l2)) {
          if (!video.lesson) video._rowVariant = "warning";
        } else {
          seenYouTubeIds.push(video.youtube_id);
          seenSubs.push(video.subs_l2);
        }
      }
    },
    async csvAll() {
      let videos = this.videosWithJSONSubs;
      for (let video of videos) {
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
        let response = await this.$directus.patch(
          `${this.$directus.youtubeVideosTableName(this.$l2.id)}/${video.id}`,
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
    unRecoveredVideos() {
      if (this.videos) {
        return this.videos.filter((v) => !v.recovered);
      } else {
        return [];
      }
    },
  },
};
</script>
