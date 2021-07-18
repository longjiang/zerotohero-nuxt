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
    <div class="youtube-videos">
      <YouTubeVideoCard
        v-for="(video, videoIndex) in videos.filter((v) =>
          this.hideVideosWithoutSubs ? v.hasSubs : true
        )"
        :video="video"
        :checkSaved="checkSavedData"
        :checkSubs="checkSubsData"
        :showSubsEditing="showSubsEditing"
        @newShow="newShow"
        ref="youTubeVideoCard"
        :key="`youtube-video-${video.youtube_id}-${videoIndex}`"
      />
    </div>
  </div>
</template>

<script>
import Helper from "@/lib/helper";
import YouTubeVideoCard from "@/components/YouTubeVideoCard";

import { Drag, Drop } from "vue-drag-drop";
export default {
  components: {
    YouTubeVideoCard,
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
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
  },
  methods: {
    newShow(show) {
      this.$emit("newShow", show);
    },
    async addAll() {
      for (let videoIndex in this.$refs.youTubeVideoCard) {
        // await Helper.timeout(500)
        this.$refs.youTubeVideoCard[videoIndex].getSubsAndSave();
      }
    },
    assignShowToAll(showID, type) {
      // type: 'tv_show' or 'talk'
      for (let videoIndex in this.$refs.youTubeVideoCard) {
        this.$refs.youTubeVideoCard[videoIndex].saveShow(showID, type);
      }
    },
    removeAll() {
      for (let videoIndex in this.$refs.youTubeVideoCard) {
        this.$refs.youTubeVideoCard[videoIndex].remove();
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
.youtube-videos {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -1rem;
}

.youtube-video-list-admin-bar {
  background: rgb(205, 207, 212);
}

.subs-drop {
  border: 1px #666 dashed;
  padding: 0.2rem 0.6rem;
}
</style>
