
<template>
  <LazyVideoWithTranscript
    class="bring-your-own-view"
    ref="video"
    v-bind="{
      type: 'bring-your-own',
      video,
      starttime,
      startLineIndex,
      skin: $skin,
      useAutoTextSize: true,
      showInfoButton: false,
      showOpenButton: true,
      autoload: true,
      autoplay: false,
      forcePortrait: false,
      initialMode,
      initialSize: this.mini ? 'mini' : 'regular',
    }"
    :key="`transcript-bring-your-own`"
    @ended="updateEnded"
    @currentTime="onCurrentTime"
    @updateLayout="onUpdateLayout"
    @updateVideo="onUpdateVideo"
  />
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
  },
  data() {
    return {
      currentTime: 0,
      fetchDone: false,
      mountedDone: false,
      startLineIndex: 0,
      video: {},
      largeEpisodeCount: undefined,
    };
  },
  computed: {
    ...mapState("stats", ["stats"]),
    currentTimeInSeconds() {
      let t = Math.floor(this.currentTime / 10) * 10;
      return t;
    },
  },
  watch: {},
  methods: {
    onUpdateVideo(video) {
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
