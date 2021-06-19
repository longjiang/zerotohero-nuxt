<template>
  <div class="youtube-video-list">
    <div
      v-if="$adminMode"
      class="
        mb-4
        youtube-video-list-admin-bar
        rounded
        bg-secondary
        text-white
        p-4
        w-100
      "
    >
      <h4>Bulk Actions</h4>
      <hr class="bg-light" />
      <div>
        <b-button variant="danger" @click="removeAll()">
          <i class="fas fa-trash mr-2"></i>
          Remove All
        </b-button>
        <b-button variant="gray" v-if="!checkSaved" @click="checkSaved = true">
          <i class="fas fa-question mr-2"></i>
          Check Saved
        </b-button>
        <b-button v-if="checkSaved" @click="checkSaved = false">
          <i class="fas fa-question mr-2"></i>
          Uncheck Saved
        </b-button>
        <b-button v-if="checkSaved" @click="addAll()">
          <i class="fas fa-plus mr-2"></i>
          Add All
        </b-button>
        <AssignShow
          @assignShow="assignShowToAll"
          :defaultSelection="keyword"
          type="tv-shows"
        />
        <AssignShow
          @assignShow="assignShowToAll"
          :defaultSelection="keyword"
          type="talks"
        />
      </div>
      <div class="mt-2">
        <drop
          @drop="handleDrop"
          :class="{
            'subs-drop bg-light text-dark rounded w-100 p-2 text-center': true,
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
      <b-checkbox class="mt-4" v-model="showSubsEditing">
        Show Subs Editing
      </b-checkbox>
    </div>
    <div class="youtube-videos">
      <YouTubeVideoCard
        v-for="(video, videoIndex) in videos"
        :video="video"
        :checkSaved="checkSaved"
        :checkSubs="checkSubs"
        :showSubsEditing="showSubsEditing"
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
  computed: {
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
  },
  components: {
    YouTubeVideoCard,
    Drag,
    Drop,
  },
  data() {
    return {
      Helper,
      videosInfoKey: 0,
      showSubsEditing: false,
      over: false,
    };
  },
  methods: {
    async addAll() {
      for (let videoIndex in this.videos) {
        // await Helper.timeout(500)
        this.$refs.youTubeVideoCard[videoIndex].getSubsAndSave();
      }
    },
    assignShowToAll(showID, type) {
      for (let videoIndex in this.videos) {
        this.$refs.youTubeVideoCard[videoIndex].saveShow(showID, type);
      }
    },
    removeAll() {
      for (let videoIndex in this.videos) {
        this.$refs.youTubeVideoCard[videoIndex].remove();
      }
    },
    handleDrop(data, event) {
      event.preventDefault();
      let files = event.dataTransfer.files;
      this.$refs.youtubeVideoList.importSrtToAll(files);
    },
    importSrtToAll(files) {
      for (let videoIndex in this.videos) {
        let card = this.$refs.youTubeVideoCard[videoIndex];
        for (let file of files) {
          if (
            card.video.title
              .replace(/\s(\d)\s/, " 0$1 ")
              .includes(file.name.replace(/[^\d]*(\d+)[^\d]*/, "$1"))
          ) {
            card.importSrt(file);
            break;
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
</style>
