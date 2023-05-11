// MyLayout.vue
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
    <ContentArea ref="contentArea">
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
  computed: {
    ...mapState("settings", ["l2Settings", "l1", "l2", "fullscreen"]),
    showTopBar() {
      if (this.fullscreen) return false; // Don't show top bar in browser's fullscreen mode (e.g. when a full-screen video is playing)
      if (this.$route.meta && this.$route.meta.layout === "full") return false;
      return true
    },
  },
  mounted() {
    $nuxt.$on("scroll-to", this.scrollTo);
    $nuxt.$on("smooth-scroll-to", this.smoothScrollTo);
  },
  beforeDestroy() {
    $nuxt.$off("scroll-to", this.scrollTo);
    $nuxt.$off("smooth-scroll-to", this.smoothScrollTo);
  },
  methods: {
    updateCollapsed(collapsed) {
      this.collapsed = collapsed;
    },
    scrollTo({top, left, behavior}) {
      this.$refs.contentArea.$el.scrollTo({top, left, behavior});
    },
    smoothScrollTo({el, offset, left, duration}) {
      this.$smoothScroll({
        container: this.$refs.contentArea.$el,
        scrollTo: el,
        updateHistory: false,
        offset,
        left,
        duration,
        easingFunction: (t) => t,
      });
    },
  },
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

#zerotohero.zerotohero-with-nav {
  &.zerotohero-wide .zerotohero-layout {
    grid-template-rows: auto auto 1fr;
    grid-template-columns: auto 1fr;
    grid-template-areas:
      "nav topbar"
      "nav secondarynav"
      "nav content";
    .zth-main-nav-wrapper {
      grid-row: 1 / 4; /* This makes the nav area span two rows */
    }
  }
  &.zerotohero-not-wide .zerotohero-layout {
    grid-template-rows: auto auto 1fr auto;
    grid-template-columns: 1fr;
    grid-template-areas:
      "topbar"
      "secondarynav"
      "content"
      "nav";
  }

  &.route-video-view {
    &.zerotohero-wide .zerotohero-layout {
      grid-template-rows: auto 1fr;
      grid-template-areas:
        "nav topbar"
        "nav content";
    }
    &.zerotohero-not-wide .zerotohero-layout {
      grid-template-rows: auto 1fr auto;
      grid-template-areas:
        "topbar"
        "content"
        "nav";
    }
  }
}

#zerotohero:not(.zerotohero-with-nav) {
  .zerotohero-layout {
    grid-template-rows: auto 1fr;
    grid-template-columns: 1fr;
    grid-template-areas:
      "topbar"
      "content";
  }
}
</style>
