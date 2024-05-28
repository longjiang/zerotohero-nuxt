<template>
  <div class="video">
    <client-only>
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
      <video
        ref="videoPlayer"
        class="video-player"
        v-if="loaded"
        @timeupdate="onTimeUpdate"
        @pause="onPause"
        @play="onPlay"
        @ended="onEnded"
        @loadedmetadata="onLoadedMetadata"
        @click="togglePaused"
        playsinline
      >
        <source
          v-for="format in formats"
          :src="video.url"
          :type="format.mime"
          :key="`video-source-${format.mime}`"
        />
        {{ $t("Your browser does not support the video tag.") }}
      </video>
    </client-only>
  </div>
</template>

<script>
export default {
  props: {
    skin: {
      default: null,
    },
    starttime: {
      type: Number,
      default: 0,
    },
    stoptime: {
      type: Number,
      default: -1,
    },
    autoload: {
      default: false,
    },
    autoplay: {
      default: false,
    },
    speed: {
      type: Number,
      default: 1,
    },
    startAtRandomTime: {
      default: false,
    },
    cc: {
      type: Boolean, // Whether to show cc inside the iframe player. If true, cc is shown. If false, cc is shown only if the user turns it on.
      default: false,
    },
    fullscreen: {
      type: Boolean, // Whether to allow fullscreen playback.
      default: false,
    },
    icon: {
      type: Boolean,
      default: true,
    },
    posterOnly: {
      type: Boolean,
      default: false,
    },
    controls: {
      type: Boolean,
      default: true, // Whether or not to show controls in the iframe player
    },
    muted: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      time: 0,
      neverPlayed: true,
      currentTime: 0,
      interval: undefined,
      duration: undefined,
      loaded: false,
      randomSeeked: false,
      formats: [],
      videoFile: null, // The uploaded video file
      subsL1File: null, // The uploaded translation subtitles file
      subsL2File: null, // The uploaded original subtitles file
    };
  },
  computed: {
    paused() {
      if (!this.$refs.videoPlayer) return true;
      else return this.$refs.videoPlayer.paused;
    },
    isPlaying() {
      return !this.paused;
    },
  },
  async mounted() {
    this.time = this.starttime;
    this.formats = this.getFormats()
  },
  destroyed() {
    const videoPlayer = this.$refs.videoPlayer;
    if (videoPlayer) {
      videoPlayer.removeEventListener("timeupdate", this.onTimeUpdate);
      videoPlayer.removeEventListener("pause", this.onPause);
      videoPlayer.removeEventListener("play", this.onPlay);
      videoPlayer.removeEventListener("ended", this.onEnded);
      videoPlayer.removeEventListener("loadedmetadata", this.onLoadedMetadata);
      videoPlayer.src = "";
      videoPlayer.load();
    }
  },
  watch: {
    speed() {
      this.setSpeed(this.speed);
    },
  },
  methods: {
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
    open() {
      this.$emit("updateVideo", {});
      this.loaded = false;
    },
    onPause() {
      this.$emit("paused", true);
    },
    onPlay() {
      this.$emit("paused", false);
      this.$emit("ended", false);
    },
    onEnded() {
      this.$emit("ended", true);
    },
    onLoadedMetadata() {
      if (this.$refs.videoPlayer) {
        this.$emit("duration", this.$refs.videoPlayer.duration);
        this.$emit("updateVideo", {...this.video, duration: this.$refs.videoPlayer.duration, width: this.$refs.videoPlayer.videoWidth, height: this.$refs.videoPlayer.videoHeight });
        this.$refs.videoPlayer.play();
      }
    },
    async loadVideo() {
      if (!this.videoFile) return;
      const url = URL.createObjectURL(this.videoFile);
      const subs_l1 = this.subsL1File ? await this.loadSubsFromFile(this.subsL1File) : null;
      const subs_l2 = this.subsL2File ? await this.loadSubsFromFile(this.subsL2File) : null;
      this.video = { url, subs_l1, subs_l2 };
      this.$emit("updateVideo", this.video);
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
    getDuration() {
      if (this.$refs.videoPlayer) return this.$refs.videoPlayer.duration;
    },
    mute() {
      if (this.$refs.videoPlayer) this.$refs.videoPlayer.muted = true;
    },
    unMute() {
      if (this.$refs.videoPlayer) this.$refs.videoPlayer.muted = false;
    },
    onTimeUpdate() {
      let player = this.$refs.videoPlayer;
      // This cannot be a computed property because the player is not monitored by Vue
      if (player) {
        let newTime = player.currentTime;
        if (newTime !== this.currentTime) {
          this.currentTime = newTime;
          if (this.currentTime === 0 && this.neverPlayed) {
            return;
          }
          this.$emit("currentTime", this.currentTime);
        }
      }
    },
    seek(starttime) {
      if (this.$refs.videoPlayer) {
        this.$refs.videoPlayer.currentTime = starttime;
      }
    },
    play() {
      if (this.$refs.videoPlayer) {
        this.$refs.videoPlayer.play();
      }
    },
    pause() {
      if (this.$refs.videoPlayer) {
        this.$refs.videoPlayer.pause();
      }
    },
    setSpeed(speed) {
      if (this.$refs.videoPlayer) {
        this.$refs.videoPlayer.playbackRate = speed;
      }
    },
    togglePaused() {
      const videoPlayer = this.$refs.videoPlayer;
      if (videoPlayer) {
        if (videoPlayer.paused) {
          videoPlayer.play();
        } else {
          videoPlayer.pause();
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.video-view-minimized {
  .upload-wrapper {
    display: none;
  }
}
.video {
  padding-bottom: 56.25%;
  position: relative;
  .upload-wrapper,
  .video-player {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }
  .upload-wrapper {
    .upload {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center; /* Center horizontally */
      align-items: center; /* Center vertically */
      border: 2px dashed rgba(136, 136, 136, 0.5);
      color: rgba(136, 136, 136, 0.85);
      border-radius: 0.25rem;
    }
  }
}
</style>
