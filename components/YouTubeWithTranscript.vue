<template>
  <div class="container-fluid youtube-with-transcript">
    <div v-if="layout === 'horizontal'" class="row">
      <div class="youtube-video-column col-md-6 mb-2">
        <div class="youtube-video-wrapper" :key="'youtube-' + video.youtube_id">
          <YouTubeVideo
            ref="youtube"
            :youtube="video.youtube_id"
            :speed="speed"
            :autoload="autoload"
            :autoplay="autoplay"
            @paused="updatePaused"
            @currentTime="updateCurrentTime"
          />
        </div>
      </div>
      <div class="col-md-6">
        <div class="youtube-video-info">
          <h5 class="mt-3" style="line-height: 1.5">
            <span v-if="video" :key="`video-title-${video.title}`" class="mt-4">
              {{ video.title }}
            </span>
          </h5>
          <div :key="`youtube-video-info-${video.youtube_id}-${videoInfoKey}`">
            <template>
              <b-button
                v-if="
                  !(video && video.id) &&
                  (this.video.subs_l2 || this.$settings.adminMode)
                "
                @click="save"
              >
                <i class="fas fa-plus mr-2"></i>
                Add to Library
              </b-button>
              <b-button
                v-if="
                  video &&
                  video.id &&
                  (this.video.subs_l2 || this.$settings.adminMode)
                "
                variant="success"
              >
                <i class="fa fa-check mr-2"></i>
                Added
              </b-button>
            </template>
            <b-dropdown
              id="dropdown-1"
              v-if="$settings.adminMode && video && video.id"
              :text="video.topic ? topics[video.topic] : 'Topic'"
              :variant="video.topic ? 'success' : undefined"
              class="ml-1"
            >
              <b-dropdown-item
                v-for="(title, slug) in topics"
                :key="`change-topic-item-${slug}`"
                @click="changeTopic(slug)"
              >
                {{ title }}
              </b-dropdown-item>
            </b-dropdown>
            <template
              v-if="$settings.adminMode && video && video.id && !video.lesson"
            >
              <b-dropdown
                id="dropdown-1"
                :text="video.level ? levels[video.level] : 'Level'"
                :variant="video.level ? 'success' : undefined"
                class="ml-1"
              >
                <b-dropdown-item
                  v-for="(title, slug) in levels"
                  :key="`change-level-item-${slug}`"
                  @click="changeLevel(slug)"
                >
                  {{ title }}
                </b-dropdown-item>
              </b-dropdown>

              <b-button
                v-if="$settings.adminMode"
                variant="danger"
                @click="remove"
                class="ml-1"
              >
                <i class="fas fa-trash-alt"></i>
              </b-button>

              <drop
                v-if="$settings.adminMode"
                @drop="handleDrop"
                :class="{
                  over: over,
                  'subs-drop': true,
                  drop: true,
                  'ml-1': true,
                  'text-dark': true,
                  btn: true,
                  'btn-light': true,
                }"
                :key="`drop-${transcriptKey}`"
                @dragover="over = true"
                @dragleave="over = false"
              >
                Drop Subs Here
              </drop>
            </template>
          </div>
          <div v-if="$settings.adminMode && video && video.id" class="mt-2">
            First line starts at
            <input
              v-model.lazy="firstLineTime"
              type="text"
              placeholder="0"
              class="d-inline-block ml-1"
              style="width: 4rem"
            />
            <b-button v-if="!subsUpdated" @click="updateSubs" class="ml-2">
              <i class="fa fa-save mr-2"></i>
              Update Subs
            </b-button>
            <b-button v-else variant="success" class="ml-2">
              <i class="fa fa-check mr-2"></i>
              Updated
            </b-button>
          </div>
          <hr v-if="video.channel" />
          <YouTubeChannelCard
            v-if="video.channel"
            :channel="video.channel"
            :key="`channel-${video.channel.id}`"
            class="d-inline-block"
          />
        </div>
        <div v-if="video.subs_l2 && video.subs_l2.length > 0" class="mt-3">
          <SyncedTranscript
            ref="transcript"
            :key="'transcript-' + video.youtube_id"
            :onSeek="seekYouTube"
            :onPause="pauseYouTube"
            :lines="video.subs_l2"
            :quiz="quiz"
            :parallellines="video.subs_l1"
            :sticky="sticky"
          />
        </div>
      </div>
    </div>
    <template v-if="layout === 'vertical'">
      <div class="row video-area">
        <div style="width: 100%">
          <div class="youtube-video-wrapper">
            <YouTubeVideo
              ref="youtube"
              @paused="updatePaused"
              @currentTime="updateCurrentTime"
              :speed="speed"
              :youtube="video.youtube_id"
              :starttime="starttime"
              :autoload="autoload"
              :autoplay="autoplay"
            />
          </div>
        </div>
      </div>
      <div class="row">
        <div :key="'transcript-' + video.youtube_id" class="mt-2 col-sm-12">
          <div
            v-if="video.subs_l2 && video.subs_l2.length > 0"
            class="text-center"
          >
            <SyncedTranscript
              ref="transcript"
              :onSeek="seekYouTube"
              :onPause="pauseYouTube"
              :lines="video.subs_l2"
              :parallellines="video.subs_l1"
              :single="true"
              :quiz="false"
              :highlight="highlight"
              :hsk="hsk"
              :highlight-saved-words="false"
              :startLineIndex="startLineIndex"
              :stopLineIndex="stopLineIndex"
              :sticky="sticky"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import Config from "@/lib/config";
import Helper from "@/lib/helper";
import { Drag, Drop } from "vue-drag-drop";
import { parseSync } from "subtitle";

export default {
  components: {
    Drag,
    Drop,
  },
  props: {
    video: {
      type: Object,
    },
    sticky: {
      default: false,
    },
    layout: {
      type: String,
      default: "horizontal", // or 'vertical'
    },
    speed: {
      type: Number,
      default: 1,
    },
    highlight: {
      type: Array,
    },
    quiz: {
      default: false,
    },
    hsk: {
      default: "outside",
    },
    autoload: {
      default: false,
    },
    autoplay: {
      default: false,
    },
    startLineIndex: {
      default: 0,
    },
    stopLineIndex: {
      default: -1,
    },
  },
  data() {
    return {
      firstLineTime: 0,
      subsUpdated: false,
      over: false,
      transcriptKey: 0,
      paused: true,
      repeat: false,
      currentTime: 0,
      videoInfoKey: 0,
      topics: Helper.topics,
      levels: Helper.levels(this.$l2),
      starttime: 0,
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
  },
  methods: {
    handleDrop(data, event) {
      event.preventDefault();
      let file = event.dataTransfer.files[0];
      let reader = new FileReader();
      reader.readAsText(file);
      reader.onload = (event) => {
        let srt = event.target.result;
        this.video.subs_l2 = parseSync(srt).map((cue) => {
          return {
            starttime: cue.data.start / 1000,
            line: cue.data.text,
          };
        });
        this.firstLineTime = this.l2_lines[0].starttime;
        this.transcriptKey++;
      };
    },
    async remove() {
      try {
        let response = await axios.delete(
          `${Config.wiki}items/youtube_videos/${this.video.id}`
        );
        if (response) {
          this.video = undefined;
        }
      } catch (err) {}
    },
    async changeLevel(slug) {
      let response = await $.ajax({
        url: `${Config.wiki}items/youtube_videos/${this.video.id}`,
        data: JSON.stringify({ level: slug }),
        type: "PATCH",
        contentType: "application/json",
        xhr: function () {
          return window.XMLHttpRequest == null ||
            new window.XMLHttpRequest().addEventListener == null
            ? new window.ActiveXObject("Microsoft.XMLHTTP")
            : $.ajaxSettings.xhr();
        },
      });
      if (response && response.data) {
        this.video = response.data;
      }
    },
    async updateSubs() {
      let response = await $.ajax({
        url: `${Config.wiki}items/youtube_videos/${this.video.id}`,
        data: JSON.stringify({ subs_l2: JSON.stringify(this.video.subs_l2) }),
        type: "PATCH",
        contentType: "application/json",
        xhr: function () {
          return window.XMLHttpRequest == null ||
            new window.XMLHttpRequest().addEventListener == null
            ? new window.ActiveXObject("Microsoft.XMLHTTP")
            : $.ajaxSettings.xhr();
        },
      });
      if (response && response.data) {
        this.subsUpdated = true;
      }
    },
    async changeTopic(slug) {
      let response = await $.ajax({
        url: `${Config.wiki}items/youtube_videos/${this.video.id}`,
        data: JSON.stringify({ topic: slug }),
        type: "PATCH",
        contentType: "application/json",
        xhr: function () {
          return window.XMLHttpRequest == null ||
            new window.XMLHttpRequest().addEventListener == null
            ? new window.ActiveXObject("Microsoft.XMLHTTP")
            : $.ajaxSettings.xhr();
        },
      });
      if (response && response.data) {
        this.video = response.data;
      }
    },
    async save() {
      try {
        let response = await axios.post(
          `${Config.wiki}items/youtube_videos`,
          Object.assign({
            l2: this.$l2.id,
            title: this.video.title,
            youtube_id: this.video.youtube_id,
            channel_id: this.video.channel ? this.video.channel.id : null,
            subs_l2: JSON.stringify(this.video.subs_l2),
          })
        );
        if (response) {
          this.video.id = response.data.data.id;
          this.videoInfoKey++;
        }
      } catch (err) {}
    },
    updatePaused(paused) {
      if (paused !== this.paused) {
        this.paused = paused;
        this.$emit("paused", this.paused);
      }
      if (this.$refs.transcript) this.$refs.transcript.paused = paused;
    },
    updateCurrentTime(currentTime) {
      if (this.currentTime !== currentTime) {
        this.currentTime = currentTime;
        this.$emit("currentTime", this.currentTime);
      }
      if (this.$refs.transcript)
        this.$refs.transcript.currentTime = currentTime;
    },
    goToPreviousLine() {
      if (this.$refs.transcript) this.$refs.transcript.goToPreviousLine();
    },
    goToNextLine() {
      if (this.$refs.transcript) this.$refs.transcript.goToNextLine();
    },
    rewind() {
      this.seekYouTube(this.video.subs_l2[this.startLineIndex].starttime);
    },
    pause() {
      this.$refs.youtube.pause();
    },
    play() {
      this.$refs.youtube.play();
    },
    getHighlightStartTime(term) {
      let matchedLines = this.video.subs_l2.filter((line) =>
        line.line.includes(term)
      );
      if (matchedLines.length > 0) {
        return matchedLines[0].starttime;
      }
    },
    getHighlightLineIndex(term) {
      return this.video.subs_l2.findIndex((line) => line.line.includes(term));
    },
    seekYouTube(starttime) {
      if (this.$refs.youtube.player) {
        this.$refs.youtube.seek(starttime);
      } else {
        this.starttime = starttime;
      }
    },
    pauseYouTube() {
      this.$refs.youtube.pause();
    },
    playYouTube() {
      this.$refs.youtube.loadYouTubeiFrame();
    },
    togglePaused() {
      this.$refs.youtube.togglePaused();
    },
  },
  watch: {
    startLineIndex() {
      if (this.$refs.youtube.player && this.$refs.youtube.player.seekTo) {
        this.rewind();
      }
    },
    repeat() {
      if (this.$refs.transcript) this.$refs.transcript.repeat = this.repeat;
    },
    firstLineTime() {
      if (this.video.subs_l2 && this.video.subs_l2.length > 0) {
        let subsShift =
          Number(this.firstLineTime) - Number(this.video.subs_l2[0].starttime);
        if (subsShift !== 0) {
          for (let line of this.video.subs_l2) {
            line.starttime = Number(line.starttime) + subsShift;
          }
        }
        this.transcriptKey++;
      }
    },
  },
  mounted() {
    if (this.video.subs_l2 && this.video.subs_l2.length > 0) {
      this.starttime = this.video.subs_l2[this.startLineIndex].starttime;
    }
  },
};
</script>

<style scoped>
.subs-drop.drop.over {
  border: 2px dashed #ccc;
}
.youtube-video-wrapper {
  max-width: calc((100vh - 8rem) * 16 / 9);
  margin: 0 auto;
  position: sticky;
  top: 0;
  background: white;
}
.youtube-video-column {
  background: white;
  position: sticky;
  top: 0;
  z-index: 9;
}

.youtube-video-info {
  padding-left: 0.667rem;
  padding-right: 0.667rem;
}
</style>