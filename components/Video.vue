<template>
  <component
    :is="currentComponent"
    :key="`${type}-${video?.youtube_id}`"
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
      video,
    }"
    ref="concreteVideo"
    @paused="onPaused"
    @currentTime="onCurrentTime"
    @ended="onEnded"
    @duration="onDuration"
    @videoUnavailable="onVideoUnavailable"
    @l1TranscriptLoaded="$emit('l1TranscriptLoaded')"
    @updateVideo="onUpdateVideo"
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
    currentComponent() {
      switch (this.type) {
        case "youtube":
          return "YouTubeVideo";
        case "bring-your-own":
          return "BringYourOwnVideo";
        default:
          return "YouTubeVideo";
      }
    },
  },
  methods: {
    onUpdateVideo(video) {
      this.$emit("updateVideo", video);
    },
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
      let videoComponent = this.$refs.concreteVideo;
      if (videoComponent && videoComponent.seek) videoComponent.seek(starttime);
    },
    play() {
      let videoComponent = this.$refs.concreteVideo;
      if (videoComponent && videoComponent.play) videoComponent.play();
    },
    pause() {
      let videoComponent = this.$refs.concreteVideo;
      if (videoComponent && videoComponent.pause) videoComponent.pause();
    },
    setSpeed(speed) {
      let videoComponent = this.$refs.concreteVideo;
      if (videoComponent && videoComponent.setSpeed)
        videoComponent.setSpeed(speed);
    },
    togglePaused() {
      let videoComponent = this.$refs.concreteVideo;
      if (videoComponent && videoComponent.togglePaused) {
        videoComponent.togglePaused();
      }
    },
    open() {
      const video = this.$refs.concreteVideo;
      if (video) video.open();
    },
  },
};
</script>

<style lang="scss" scoped>
</style>
