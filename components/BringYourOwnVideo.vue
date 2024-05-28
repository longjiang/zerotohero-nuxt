<template>
  <div class="video">
    <client-only>
      <video
        ref="videoPlayer"
        class="video-player"
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
    video: {
      type: Object,
      required: true,
    },
    formats: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      time: 0,
      neverPlayed: true,
      currentTime: 0,
      interval: undefined,
      duration: undefined,
      randomSeeked: false,
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
    open() {
      this.$emit("updateVideo", null);
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
