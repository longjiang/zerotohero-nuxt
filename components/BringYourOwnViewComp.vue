
<template>
  <div>
    <div class="upload-wrapper pl-4 pr-4 pt-3" v-if="!loaded">
        <div class="upload">
          <div class="w-100 p-4">
            <p>{{ $t("Upload your {l2} video file ({formats}), and subtitles files (.srt) in {l2} and {l1}, then press \"{button}\".", {
                formats: formats.map(f => f.ext).join(', '),
                l2: $t($l2.name),
                l1: $t($l1.name),
                button: $t('Load Video'),
              }) }}</p>
            <b-form-file
              class="mb-2"
              :accept="formats.map((f) => '.' + f.ext).join(',')"
              v-model="videoFile"
              :placeholder="$t($t('Choose a video ({formats}) to open:', {
                  formats: formats.map(f => f.ext).slice(0,3).join(', '),
                }))"
              :drop-placeholder="$t('Drop file here...')"
              :browse-text="$t('Browse')"
            ></b-form-file>
            <b-form-file
              class="mb-2"
              accept=".srt"
              v-model="subsL2File"
              :placeholder="$t('Upload original subtitles (.srt)')"
              :drop-placeholder="$t('Drop file here...')"
              :browse-text="$t('Browse')"
            ></b-form-file>
            <b-form-file
              class="mb-4"
              accept=".srt"
              v-model="subsL1File"
              :placeholder="$t('Upload translation subtitles (.srt)')"
              :drop-placeholder="$t('Drop file here...')"
              :browse-text="$t('Browse')"
            ></b-form-file>
            <b-button @click="loadVideo" variant="primary" class="d-block w-100" :disabled="!videoFile || !subsL2File">
              {{ $t("Load Video") }}
            </b-button>
          </div>
        </div>
      </div>
      <LazyVideoWithTranscript
        class="bring-your-own-view"
        ref="video"
        v-if="loaded"
        v-bind="{
          type: 'bring-your-own',
          video,
          formats,
          starttime,
          startLineIndex,
          skin: $skin,
          useAutoTextSize: true,
          showInfoButton: true,
          showOpenButton: true,
          autoload: true,
          autoplay: false,
          forcePortrait: false,
          initialMode,
          initialSize: this.mini ? 'mini' : 'regular',
          showQuiz,
        }"
        :key="`transcript-bring-your-own`"
        @ended="updateEnded"
        @currentTime="onCurrentTime"
        @updateLayout="onUpdateLayout"
        @updateVideo="onUpdateVideo"
        @open="onOpen"
      />
  </div>
</template>

<script>
import { mapState } from "vuex";
import Vue from "vue";

export default {
  props: {
    mini: {
      type: Boolean,
      default: false,
      required: false,
    },
    initialMode: {
      default: "subtitles",
    },
    landscape: {
      default: false,
    },
    starttime: {
      default: 0,
    },
    showQuiz: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      currentTime: 0,
      fetchDone: false,
      mountedDone: false,
      startLineIndex: 0,
      video: null,
      largeEpisodeCount: undefined,
      loaded: false, // Whether the video has been loaded
      formats: [],
      videoFile: null, // The uploaded video file
      subsL1File: null, // The uploaded translation subtitles file
      subsL2File: null, // The uploaded original subtitles file
    };
  },
  computed: {
    ...mapState("stats", ["stats"]),
    currentTimeInSeconds() {
      let t = Math.floor(this.currentTime / 10) * 10;
      return t;
    },
  },
  mounted() {
    this.formats = this.getFormats()
  },
  methods: {
    onOpen() {
      this.video = null;
      this.videoFile = null;
      this.subsL1File = null;
      this.subsL2File = null;
      this.loaded = false;
    },
    getFormats() {
      const video = document.createElement("video");

      // The different video formats to check for
      const formats =  [
        { ext: 'mp4', mime: 'video/mp4' },
        { ext: 'webm', mime: 'video/webm' },
        { ext: 'ogg', mime: 'video/ogg' },
        { ext: 'mkv', mime: 'video/x-matroska' },
        { ext: 'avi', mime: 'video/x-msvideo' },
        { ext: 'mpeg', mime: 'video/mpeg' },
        { ext: 'flv', mime: 'video/x-flv' },
        { ext: 'mp3', mime: 'audio/mpeg' },
        { ext: 'ogg', mime: 'audio/ogg' },
        { ext: 'wav', mime: 'audio/wav' },
        { ext: 'aac', mime: 'audio/aac' },
        { ext: 'flac', mime: 'audio/flac' },
        { ext: 'opus', mime: 'audio/opus' }
      ]
      let supportedFormats = formats.filter(
        (format) => video.canPlayType(format.mime) !== ""
      );
      supportedFormats = [{ ext: 'mkv', mime: 'video/x-matroska' }, ...supportedFormats]
      return supportedFormats;
    },
    async loadVideo() {
      if (!this.videoFile) return;
      const url = URL.createObjectURL(this.videoFile);
      const subs_l1 = this.subsL1File ? await this.loadSubsFromFile(this.subsL1File) : null;
      const subs_l2 = this.subsL2File ? await this.loadSubsFromFile(this.subsL2File) : null;
      const video = { url, subs_l1, subs_l2 };
      Vue.set(this, "video", video);
      this.loaded = true;
    },
    async loadSubsFromFile(file) {
      let reader = new FileReader();
      
      const fileContent = await new Promise((resolve, reject) => {
        reader.onload = event => resolve(event.target.result);
        reader.onerror = error => reject(error);
        reader.readAsText(file);
      });

      let srt = fileContent;

      let subs = this.$subs.parseSrt(srt)
      
      return subs;
    },
    onUpdateVideo(video) {
      if (!video) return
      Vue.set(this, "video", video);
    },
    onUpdateLayout(layout) {
      this.$emit("updateLayout", layout);
    },
    onCurrentTime(currentTime) {
      if (this.currentTime !== currentTime) {
        this.currentTime = currentTime;
        this.$emit("currentTime", this.currentTime);
      }
    },
    async updateEnded(ended) {
      if (ended !== this.ended) {
        this.ended = ended;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
</style>
