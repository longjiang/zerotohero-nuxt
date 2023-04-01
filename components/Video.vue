<template>
  <YouTubeVideo
    v-if="video?.youtube_id"
    :key="`${type}-${video.youtube_id}`"
    v-bind="{
      starttime,
      stoptime,
      autoload,
      autoplay,
      speed,
      startAtRandomTime,
      cc,
      fullscreen,
      icon,
      posterOnly,
      controls,
      muted,
      video
    }"
    ref="video"
    @paused="onPaused"
    @currentTime="onCurrentTime"
    @ended="onEnded"
    @duration="onDuration"
    @videoUnavailable="onVideoUnavailable"
    @l1TranscriptLoaded="$emit('l1TranscriptLoaded')"
  />
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: "youtube",
    },
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
    return {};
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
    onPaused(paused) {
      this.$emit("paused", paused);
    },
    onCurrentTime(currentTime) {
      this.$emit("currentTime", currentTime);
    },
    onEnded(ended) {
      this.$emit("ended", ended);
    },
    onDuration(duration) {
      this.$emit("duration", duration);
    },
    onVideoUnavailable(videoUnavailable) {
      this.$emit("videoUnavailable", videoUnavailable);
    },
    seek(starttime) {
      let videoComponent = this.$refs.video;
      if (videoComponent && videoComponent.seek) videoComponent.seek(starttime);
    },
    play() {
      let videoComponent = this.$refs.video;
      if (videoComponent && videoComponent.play) videoComponent.play();
    },
    pause() {
      let videoComponent = this.$refs.video;
      if (videoComponent && videoComponent.pause) videoComponent.pause();
    },
    setSpeed(speed) {
      let videoComponent = this.$refs.video;
      if (videoComponent && videoComponent.setSpeed)
        videoComponent.setSpeed(speed);
    },
    togglePaused() {
      let videoComponent = this.$refs.video;
      if (videoComponent && videoComponent.togglePaused) {
        videoComponent.togglePaused();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
</style>
