<template>
  <div class="container-fluid youtube-with-transcript">
    <div v-if="layout === 'horizontal'" class="row">
      <div class="youtube-video-column col-sm-12 mb-4 p-0">
        <div class="youtube-video-wrapper" :key="'youtube-' + video.youtube_id">
          <YouTubeVideo
            ref="youtube"
            @paused="updatePaused"
            @currentTime="updateCurrentTime"
            @ended="updateEnded"
            :speed="speed"
            :youtube="video.youtube_id"
            :starttime="start"
            :autoload="autoload"
            :autoplay="autoplay"
          />
        </div>
      </div>
      <div class="youtube-transcript-column col-sm-12">
        <div class="youtube-video-info">
          <h5 style="line-height: 1.5">
            <span v-if="video" :key="`video-title-${video.title}`" class="mt-4">
              {{ video.title }}
            </span>
          </h5>
          <div :key="`youtube-video-info-${video.youtube_id}-${videoInfoKey}`">
            <template>
              <b-button
                v-if="
                  !(video && video.id) &&
                  (this.video.subs_l2 || this.$adminMode)
                "
                @click="save"
              >
                <i class="fas fa-plus mr-2"></i>
                Add to Library
              </b-button>
              <span
                v-if="
                  video &&
                  video.id &&
                  !show &&
                  (this.video.subs_l2 || this.$adminMode)
                "
              >
                <i class="fas fa-check-circle mr-2 text-success"></i>
                Added
              </span>
              <router-link
                v-if="previousEpisode"
                :to="previousEpisode"
                class="btn btn-small btn-primary"
              >
                <i class="fa fa-chevron-left"></i>
                Previous
              </router-link>
              <router-link
                v-if="show"
                :to="`/${$l1.code}/${$l2.code}/youtube/browse/all/all/0/${show.title}`"
                class="btn btn-small btn-primary"
              >
                <i class="far fa-clone"></i>
                All Episodes
              </router-link>
              <router-link
                v-if="nextEpisode"
                :to="nextEpisode"
                class="btn btn-small btn-primary"
              >
                Next
                <i class="fa fa-chevron-right"></i>
              </router-link>
            </template>
            <b-dropdown
              id="dropdown-1"
              v-if="$adminMode && video && video.id"
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
            <template v-if="$adminMode && video && video.id && !video.lesson">
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
                v-if="$adminMode"
                variant="danger"
                @click="remove"
                class="ml-1"
              >
                <i class="fas fa-trash-alt"></i>
              </b-button>

              <drop
                v-if="$adminMode"
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
          <div v-if="$adminMode && video && video.id" class="mt-2">
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
            :lines="video.subs_l2"
            :quiz="quiz"
            :parallellines="video.subs_l1"
            :sticky="sticky"
            @seek="seekYouTube"
            @pause="pause"
            @play="play"
            @speechStart="speechStart"
            @speechEnd="speechEnd"
          />
          <div class="text-center mt-5">
            <router-link
              v-if="previousEpisode"
              :to="previousEpisode"
              class="btn btn-primary"
            >
              <i class="fa fa-chevron-left"></i>
              Previous
            </router-link>
            <router-link
              v-if="show"
              :to="`/${$l1.code}/${$l2.code}/youtube/browse/all/all/0/${show.title}`"
              class="btn btn-primary"
            >
              <i class="far fa-clone"></i>
              All Episodes
            </router-link>
            <router-link
              v-if="nextEpisode"
              :to="nextEpisode"
              class="btn btn-primary"
            >
              Next
              <i class="fa fa-chevron-right"></i>
            </router-link>
          </div>
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
              @ended="updateEnded"
              :speed="speed"
              :youtube="video.youtube_id"
              :starttime="start"
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
              @seek="seekYouTube"
              @pause="pause"
              @play="play"
              @speechStart="speechStart"
              @speechEnd="speechEnd"
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
    show: {
      type: Object,
    },
    previousEpisode: {
      type: String,
    },
    nextEpisode: {
      type: String,
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
      default: undefined,
    },
    starttime: {
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
      speaking: false,
      over: false,
      transcriptKey: 0,
      paused: true,
      repeatMode: false,
      audioMode: false,
      currentTime: 0,
      videoInfoKey: 0,
      topics: Helper.topics,
      levels: Helper.levels(this.$l2),
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
    start() {
      let starttime =
        this.video.subs_l2 &&
        this.video.subs_l2.length > 0 &&
        this.startLineIndex
          ? this.video.subs_l2[this.startLineIndex].starttime
          : this.starttime;
      return starttime;
    },
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
  },
  updated() {
    if (this.$refs.transcript) {
      this.$refs.transcript.repeatMode = this.repeatMode;
      this.$refs.transcript.audioMode = this.audioMode;
    }
    if (this.$refs.youtube) this.$refs.youtube.speed = this.speed;
  },
  methods: {
    handleDrop(data, event) {
      event.preventDefault();
      let file = event.dataTransfer.files[0];
      let reader = new FileReader();
      reader.readAsText(file);
      let parsed = [];
      reader.onload = (event) => {
        let srt = event.target.result;
        parsed = parseSync(srt).map((cue) => {
          return {
            starttime: cue.data.start / 1000,
            line: cue.data.text,
          };
        });
        this.video.subs_l2 = Helper.uniqueByValue(parsed, "starttime");
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
      try {
        let response = await axios.patch(
          `${Config.wiki}items/youtube_videos/${this.video.id}`,
          { subs_l2: JSON.stringify(this.video.subs_l2) }
        );
        if (response && response.data) {
          this.subsUpdated = true;
        }
      } catch (err) {}
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
    updateEnded(ended) {
      if (ended !== this.ended) {
        this.ended = ended;
        this.$emit("ended", this.ended);
      }
      if (this.$refs.transcript) this.$refs.transcript.ended = ended;
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
    goToLine(line) {
      if (this.$refs.transcript) this.$refs.transcript.goToLine(line);
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
    speechStart() {
      this.$emit("speechStart");
      this.speaking = true;
    },
    speechEnd() {
      this.$emit("speechEnd");
      this.speaking = false;
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
      this.$refs.youtube.seek(starttime);
    },
    pause() {
      this.$refs.youtube.pause();
    },
    togglePaused() {
      if (this.audioMode) {
        console.log('this.speaking', this.speaking)
        if (this.speaking) {
          this.$refs.transcript.stopAudioModeStuff();
        } else {
          this.$refs.transcript.doAudioModeStuff();
        }        
      } else {
        this.$refs.youtube.togglePaused();
      }
    },
  },
  watch: {
    startLineIndex() {
      if (this.$refs.youtube.player && this.$refs.youtube.player.seekTo) {
        this.rewind();
      }
    },
    repeatMode() {
      if (this.$refs.transcript)
        this.$refs.transcript.repeatMode = this.repeatMode;
    },
    audioMode() {
      if (this.$refs.transcript)
        this.$refs.transcript.audioMode = this.audioMode;
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

@media screen and (orientation: landscape) {
  .youtube-video-column,
  .youtube-transcript-column {
    flex: 1;
  }
}
</style>