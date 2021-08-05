<template>
  <div class="youtube-video-list">
    <div
      v-if="$adminMode"
      class="mb-4 youtube-video-list-admin-bar rounded p-4 w-100"
    >
      <div>
        <b-button
          class="mt-1 mb-1"
          variant="danger"
          @click="removeAll()"
          size="sm"
        >
          <i class="fas fa-trash mr-2"></i>
          Remove All
        </b-button>
        <b-button
          class="mt-1 mb-1"
          variant="gray"
          v-if="!checkSavedData"
          size="sm"
          @click="checkSavedData = true"
        >
          <i class="fas fa-question mr-2"></i>
          Check Saved
        </b-button>
        <b-button
          class="mt-1 mb-1"
          variant="gray"
          v-if="checkSavedData"
          size="sm"
          @click="checkSavedData = false"
        >
          <i class="fas fa-question mr-2"></i>
          Uncheck Saved
        </b-button>
        <b-button
          class="mt-1 mb-1"
          variant="gray"
          v-if="checkSavedData"
          size="sm"
          @click="addAll()"
        >
          <i class="fas fa-plus mr-2"></i>
          Add All
        </b-button>
        <AssignShow
          size="sm"
          @assignShow="assignShowToAll"
          :defaultSelection="keyword"
          type="tv-shows"
        />
        <AssignShow
          size="sm"
          @assignShow="assignShowToAll"
          :defaultSelection="keyword"
          type="talks"
        />
        <drop
          @drop="handleDrop"
          :class="{
            'subs-drop text-secondary rounded d-inline-block text-center mt-1': true,
            over: over,
            drop: true,
          }"
          :key="`drop-${_uid}`"
          @dragover="over = true"
          @dragleave="over = false"
        >
          Drop SRT files here to bulk add subs ...
        </drop>
      </div>
      <div class="mt-1">
        <b-form-checkbox
          class="mt-2 d-inline-block"
          v-model="hideVideosWithoutSubs"
        >
          Hide Videos Without Subs
        </b-form-checkbox>
        <b-form-checkbox class="mt-2 d-inline-block" v-model="showSubsEditing">
          Show Subs Editing
        </b-form-checkbox>
      </div>
    </div>
    <div class="youtube-videos row">
      <div
        :class="{
          'col-sm-12': view === 'list' || singleColumn,
          'col-xs-12 col-sm-6 col-md-4 col-lg-3': view === 'grid' && !singleColumn,
          'd-none': hideVideosWithoutSubs ? !video.hasSubs : false,
        }"
        :style="`padding-bottom: ${view === 'list' ? '1rem' : '2rem'}`"
        v-for="(video, videoIndex) in videos"
        :key="`youtube-video-wrapper-${video.youtube_id}-${videoIndex}`"
      >
        <YouTubeVideoCard
          v-if="hideVideosWithoutSubs ? video.hasSubs : true"
          :video="video"
          :checkSubs="checkSubsData"
          :showSubsEditing="showSubsEditing"
          :checkSaved="checkSavedData"
          @newShow="newShow"
          ref="youTubeVideoCard"
          :key="`youtube-video-${video.youtube_id}-${videoIndex}`"
          :view="view"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Helper from "@/lib/helper";
import Config from "@/lib/config";
import { Drag, Drop } from "vue-drag-drop";
import Vue from "vue";

export default {
  components: {
    Drag,
    Drop,
  },
  props: {
    videos: {
      type: Array,
    },
    keyword: {
      type: String,
    },
    checkSaved: {
      type: Boolean,
      default: false,
    },
    checkSubs: {
      type: Boolean,
      default: false,
    },
    view: {
      type: String,
      default: 'grid'
    },
    singleColumn: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      Helper,
      videosInfoKey: 0,
      showSubsEditing: false,
      checkSavedData: this.checkSaved,
      checkSubsData: this.checkSubs,
      over: false,
      hideVideosWithoutSubs: false,
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
  },
  watch: {
    async checkSavedData() {
      if (this.checkSavedData) {
        await this.checkSavedFunc(this.videos);
      } else {
        for (let video of this.videos) {
          delete video.tv_show;
          delete video.talk;
          Vue.delete(video, "id");
        }
      }
    },
  },
  methods: {
    async checkSavedFunc(videos) {
      videos = videos.filter((v) => !v.id); // Only check those that are not saved
      let youtube_ids = videos.map((v) => v.youtube_id);
      let chunks = Helper.arrayChunk(youtube_ids, 100);
      for (let youtube_ids of chunks) {
        let response = await axios.get(
          `${
            Config.wiki
          }items/youtube_videos?filter[youtube_id][in]=${youtube_ids}&fields=id,title,channel_id,youtube_id,tv_show.*,talk.*${
            this.showSubsEditing ? ",subs_l2" : ""
          }&filter[l2][eq]=${this.$l2.id}&timestamp=${
            this.$adminMode ? Date.now() : 0
          }`
        );
        if (response.data && response.data.data && response.data.data[0]) {
          let savedVideos = response.data.data;
          for (let video of videos) {
            let savedVideo = savedVideos.find(
              (v) => v.youtube_id === video.youtube_id
            );
            if (savedVideo) {
              video.tv_show = savedVideo.tv_show;
              video.talk = savedVideo.talk;
              if (savedVideo.subs_l2) {
                let subs_l2 = YouTube.parseSavedSubs(savedVideo.subs_l2);
                if (subs_l2[0]) {
                  video.subs_l2 = subs_l2;
                  this.firstLineTime = video.subs_l2[0].starttime;
                }
              }
              Vue.set(video, "id", savedVideo.id);
            }
          }
        }
      }
    },
    newShow(show) {
      this.$emit("newShow", show);
    },
    async batch(f) {
      let indices = Object.keys(this.$refs.youTubeVideoCard);
      let chunks = Helper.arrayChunk(indices, 3);
      for (let chunk of chunks) {
        let promises = [];
        for (let videoIndex of chunk) {
          promises.push(f(videoIndex));
        }
        await Promise.all(promises);
      }
    },
    async addAll() {
      this.batch((videoIndex) =>
        this.$refs.youTubeVideoCard[videoIndex].getSubsAndSave()
      );
    },
    async assignShowToAll(show, type) {
      // type: 'tv_show' or 'talk'
      this.batch((videoIndex) =>
        this.$refs.youTubeVideoCard[videoIndex].saveShow(show, type)
      );
    },
    async removeAll() {
      for (let videoIndex in this.$refs.youTubeVideoCard) {
        await this.$refs.youTubeVideoCard[videoIndex].remove();
      }
    },
    handleDrop(data, event) {
      event.preventDefault();
      let files = event.dataTransfer.files;
      this.importSrtToAll(files);
    },
    importSrtToAll(files) {
      for (let file of files) {
        for (let videoIndex in this.$refs.youTubeVideoCard) {
          let card = this.$refs.youTubeVideoCard[videoIndex];
          let numsInFileName = file.name.match(/\d+/g);
          let numsInVideoTitle = card.video.title.match(/\d+/g);
          let found = false;
          if (numsInFileName && numsInVideoTitle) {
            for (let n of numsInFileName) {
              for (let m of numsInVideoTitle) {
                if (Number(n) === Number(m)) {
                  found = true;
                }
              }
            }
            if (found !== false) {
              card.importSrt(file);
            }
          }
        }
      }
    },
  },
};
</script>

<style lang="scss">
.youtube-video-list-admin-bar {
  background: rgb(205, 207, 212);
}

.subs-drop {
  border: 1px #666 dashed;
  padding: 0.2rem 0.6rem;
}
</style>
