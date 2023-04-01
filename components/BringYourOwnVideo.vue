<template>
  <div class="video">
    <div class="video-frame" v-if="!videoUrl">
      <input type="file" accept=".mp4,.mkv" @change="loadVideo" />
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
      <source :src="videoUrl" type="video/mp4" />
      <source :src="videoUrl" type="video/mkv" />
      Your browser does not support the video tag.
    </video>
  </div>
</template>

<script>
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
      player: undefined,
      currentTime: 0,
      interval: undefined,
      duration: undefined,
      loading: false,
      randomSeeked: false,
      videoUrl: undefined,
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
      return this.player && this.player.getPlayerState
        ? this.player.getPlayerState() !== 1
        : true;
    },
    isPlaying() {
      let playing =
        this.player &&
        this.player.getPlayerState &&
        this.player.getPlayerState() === 1;
      return playing;
    },
  },
  async mounted() {
    this.time = this.starttime;
  },
  destroyed() {
    if (this.player) {
      this.player.destroy();
      this.player = undefined;
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
      if (this.$refs.videoPlayer)
        this.$emit("duration", this.$refs.videoPlayer.duration);
    },
    loadVideo(event) {
      const file = event.target.files[0];
      if (file) {
        this.videoUrl = URL.createObjectURL(file);
      }
    },
    getDuration() {
      if (this.player) {
        let duration = this.player.getDuration();
        return duration;
      }
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
  .video-frame,
  .video-player {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }
}
</style>
