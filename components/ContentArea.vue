<template>
  <div class="content-area zth-content">
    <VideoViewComp
      id="overlay-player"
      ref="video-view-comp"
      v-if="overlayPlayerType && $route.params.l2"
      v-bind="{
        type: overlayPlayerType,
        youtube_id: overlayPlayerYouTubeId,
        directus_id: overlayPlayerDirectusId ? Number(overlayPlayerDirectusId) : undefined,
        lesson: overlayPlayerLesson,
        mini: overlayPlayerMinimized,
        key: `video-view-comp-${overlayPlayerYouTubeId}`,
      }"
      @close="overlayPlayerClose"
    />
    <slot v-if="overlayPlayerMinimized"></slot>
  </div>
</template>
<script>
import { mapState } from "vuex";

export default {
  data() {
    return {
      overlayPlayerYouTubeId: undefined,
      overlayPlayerLesson: undefined,
      overlayPlayerType: undefined,
    }
  },
  computed: {
    ...mapState("settings", ["l1", "l2"]),
    overlayPlayerMinimized() {
      return this.$route.name !== "l1-l2-video-view-type";
    },
    combinedLanguages() {
      return `${this.$l1?.code}-${this.$l2?.code}`;
    },
  },
  created() {
    this.updateOverlayPlayerProps();
  },
  watch: {
    $route() {
      this.updateOverlayPlayerProps();
    },
    combinedLanguages() {
      this.onLanguageChange();
    },
  },
  methods: {
    onLanguageChange() {
      this.overlayPlayerClose();
    },
    overlayPlayerClose() {
      this.overlayPlayerType = undefined;
      this.overlayPlayerYouTubeId = undefined;
      this.overlayPlayerLesson = undefined;
    },
    updateOverlayPlayerProps() {
      if (this.$route.name === "l1-l2-video-view-type") {
        this.overlayPlayerType = this.$route.params.type
        this.overlayPlayerYouTubeId = this.$route.query.v || this.$route.params.youtube_id;
        this.overlayPlayerLesson = this.$route.query.lesson || this.$route.params.lesson;
        this.overlayPlayerDirectusId = this.$route.query.id || this.$route.params.directus_id;
      }
    },
  },
};

</script>

<style scoped>
.content-area {
  grid-area: content;
  overflow: auto;
}
</style>
