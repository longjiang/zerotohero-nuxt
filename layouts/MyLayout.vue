<template>
  <div class="zerotohero-layout">
    <FeedbackButton />
    <HydrationNotice v-if="$route.path === '/'" />
    <client-only>
      <!-- Main nav - side bar on wide screen, bottom bar on small screen /-->
      <NavMain
        v-if="!fullscreen && $route.params.l1 && $route.params.l2 && l1 && l2"
        class="zth-main-nav-wrapper"
        :l1="l1"
        :l2="l2"
        :key="`nav-main-${l1.code}-${l2.code}`"
        :variant="wide ? 'side-bar' : 'bottom-bar'"
        :skin="$skin"
        @collapsed="updateCollapsed"
      />
      <SiteTopBar
        v-if="showTopBar"
        :skin="$skin"
        variant="menu-bar"
        :badge="savedWordsCount + savedPhrasesCount"
        :wide="wide"
      />
      <!-- SECONDARY NAV (Hidden on YouTubeView) -->
      <NavSecondary
        v-if="l1 && l2 && $route.params.l1 && $route.params.l2"
        :class="{
          'zth-secondary-nav-wrapper': true,
          'd-none': $route.name === 'video-view',
        }"
        variant="menu-bar"
        v-bind="{
          l1,
          l2,
        }"
        :key="`nav-secondary-${l1.code}-${l2.code}`"
      />
    </client-only>
    <ContentArea>
      <slot></slot>
    </ContentArea>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  props: {
    wide: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      overlayPlayerYouTubeId: undefined,
      overlayPlayerLesson: undefined,
      overlayPlayerType: undefined,
    }
  },
  computed: {
    ...mapState("settings", ["l2Settings", "l1", "l2", "fullscreen"]),
    savedPhrasesCount() {
      let count = this.$store.getters["savedPhrases/count"]({
        l2: this.l2.code,
      });
      return count;
    },
    showTopBar() {
      if (this.fullscreen) return false;
      if (this.$route.meta && this.$route.meta.layout === "full") return false;
      else
        return (
          this.$route.params.l1 && this.$route.params.l1 && this.l1 && this.l2
        );
    },
    overlayPlayerMinimized() {
      return this.$route.name !== "video-view";
    },
    savedWordsCount() {
      let count = this.$store.getters["savedWords/count"]({ l2: this.l2.code });
      return count;
    },
  },
  created() {
    this.updateOverlayPlayerProps();
  },
  watch: {
    $route() {

      this.updateOverlayPlayerProps();
    }
  },
  methods: {
    overlayPlayerClose() {
      this.overlayPlayerType = undefined;
      this.overlayPlayerYouTubeId = undefined;
      this.overlayPlayerLesson = undefined;
    },
    updateCollapsed(collapsed) {
      this.collapsed = collapsed;
    },
    updateOverlayPlayerProps() {
      if (this.$route.name === "video-view") {
        this.overlayPlayerType = this.$route.params.type;
        this.overlayPlayerYouTubeId = this.$route.params.youtube_id;
        this.overlayPlayerLesson = this.$route.params.lesson;
      }
    },
  }
};
</script>

<style lang="scss" scoped>

.zerotohero-layout {
  display: grid;
  height: 100vh;
  .zth-main-nav-wrapper {
    grid-area: nav;
  }
  .zth-secondary-nav-wrapper {
    grid-area: secondarynav;
  }
}

.zerotohero-wide .zerotohero-layout {
  grid-template-rows: auto 1fr;
  grid-template-columns: 13rem 1fr;
  grid-template-areas:
    'nav topbar'
    'nav secondarynav'
    'nav content';
  .zth-main-nav-wrapper {
    grid-row: 1 / 4; /* This makes the nav area span two rows */
  }
}

.zerotohero-not-wide .zerotohero-layout {
  grid-template-rows: auto auto 1fr;
  grid-template-columns: 1fr;
  grid-template-areas:
    'topbar'
    'secondarynav'
    'content'
    'nav',
}
</style>
