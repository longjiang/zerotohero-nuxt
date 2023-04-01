
<template>
  <LazyVideoWithTranscript
    v-if="video"
    ref="youtube"
    skin="dark"
    v-bind="{
      type: 'youtube',
      video,
      starttime,
      startLineIndex,
      useAutoTextSize: true,
      showInfoButton: true,
      autoload: true,
      autoplay: false,
      forcePortrait: false,
      initialLayout,
    }"
    :key="`transcript-bring-your-own`"
    @ended="updateEnded"
    @currentTime="onCurrentTime"
    @updateLayout="onUpdateLayout"
  />
</template>

<script>
import { mapState } from "vuex";

export default {
  props: {
    mini: {
      type: Boolean,
      default: false,
      required: false,
    },
    initialLayout: {
      default: "vertical",
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
      video: undefined,
      largeEpisodeCount: undefined,
    };
  },
  computed: {
    ...mapState("stats", ["stats"]),
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
    currentTimeInSeconds() {
      let t = Math.floor(this.currentTime / 10) * 10;
      return t;
    },
  },
  watch: {
  },
  methods: {
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
