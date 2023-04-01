<template>
  <div class="video">
    <div class="upload-wrapper" v-if="!loaded">
      <div>
        <label for="video-upload">Choose a video (mp4 or mkv) to open:</label>
        <br />
        <input type="file" accept=".mp4,.mkv" @change="loadVideo" />
      </div>
    </div>
    <video
      ref="videoPlayer"
      class="video-player"
      v-else
      @timeupdate="onTimeUpdate"
      @pause="onPause"
      @play="onPlay"
      @ended="onEnded"
      @loadedmetadata="onLoadedMetadata"
    >
      <source :src="video.url" type="video/mp4" />
      <source :src="video.url" type="video/mkv" />
      {{ $t("Your browser does not support the video tag.") }}
    </video>
  </div>
</template>

<script>
import Vue from "vue";

export default {
  props: {
    video: {
      type: Object,
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
        this.$refs.videoPlayer.play()
      }        
    },
    loadVideo(event) {
      const file = event.target.files[0];
      if (file) {
        Vue.set(this.video, "url", URL.createObjectURL(file));
        this.loaded = true
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
    display: flex;
    justify-content: center; /* Center horizontally */
    align-items: center; /* Center vertically */
  }
}
</style>
