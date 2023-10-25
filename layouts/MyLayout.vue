// MyLayout.vue
<template>
  <div class="zerotohero-layout" :class="{fullscreen, wide, tall, landscape, 'with-nav': withNav }">
    <!-- <FeedbackButton /> -->
    <HydrationNotice v-if="$route.path === '/'" />
    <client-only>
      <!-- Main nav - side bar on wide screen, bottom bar on small screen /-->
      <PopupDictionaryModal v-if="l1 && l2" />
      <TokenizedTextMenuModal v-if="l1 && l2" />
      <NavMain
        v-if="withNav"
        class="zth-main-nav-wrapper"
        :l1="l1"
        :l2="l2"
        :key="`nav-main-${l1.code}-${l2.code}`"
        :variant="wide || landscape ? 'side-bar' : 'bottom-bar'"
        :skin="$skin"
        :showLogo="tall"
        @collapsed="updateCollapsed"
      />
      <SiteTopBar
        v-if="showTopBar"
        :skin="$skin"
        variant="menu-bar"
      />
      <!-- SECONDARY NAV (Hidden on YouTubeView) -->
      <NavSecondary
        v-if="!fullscreen && l1 && l2 && $route.params.l1 && $route.params.l2"
        :class="{
          'zth-secondary-nav-wrapper': true,
          'd-none': $route.name === 'l1-l2-video-view-type',
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
    tall: {
      type: Boolean,
      default: false,
    },
    landscape: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapState("settings", ["l2Settings", "l1", "l2", "fullscreen"]),
    withNav() {
      return !this.fullscreen && this.$route.params.l1 && this.$route.params.l2 && this.l1 && this.l2
    },
    showTopBar() {
      if (this.fullscreen) return false; // Don't show top bar in browser's fullscreen mode (e.g. when a full-screen video is playing)
      if (this.$route.meta && this.$route.meta.layout === "full") return false;
      return true
    },
    showLogo() {
      if (typeof window !== 'undefined' && window.innerHeight < 900) return false;
    },
  },
  mounted() {
    $nuxt.$on("scroll-to", this.scrollTo);
    $nuxt.$on("smooth-scroll-to", this.smoothScrollTo);
    this.setVH();
    window.addEventListener("resize", this.setVH);
    window.addEventListener("orientationchange", this.setVH); // Listen to orientationchange event
  },
  beforeDestroy() {
    $nuxt.$off("scroll-to", this.scrollTo);
    $nuxt.$off("smooth-scroll-to", this.smoothScrollTo);
    window.removeEventListener("resize", this.setVH);
  },
  methods: {
    /**
     * Set CSS variable --vh to the height of the viewport
     * This is to fix the height of the layout on mobile browsers
     */
    setVH() {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    },
    updateCollapsed(collapsed) {
      this.collapsed = collapsed;
    },
    scrollTo({ top = 0, left = 0, behavior = "smooth" }) {
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
  height: calc(var(--vh, 1vh) * 100); // This is to fix the height of the layout on mobile browsers
  .zth-main-nav-wrapper {
    grid-area: nav;
  }
  .zth-secondary-nav-wrapper {
    grid-area: secondarynav;
  }
  &.fullscreen {
    padding-top: env(safe-area-inset-top);
  }
}

#zerotohero {
  .zerotohero-layout.with-nav.wide,
  .zerotohero-layout.with-nav.landscape {
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
  
  .zerotohero-layout.with-nav:not(.wide):not(.landscape) {
    grid-template-rows: auto auto 1fr auto;
    grid-template-columns: 1fr;
    grid-template-areas:
      "topbar"
      "secondarynav"
      "content"
      "nav";

  }

  &.route-video-view {
    .zerotohero-layout.with-nav.wide {
      grid-template-rows: auto 1fr;
      grid-template-areas:
        "nav topbar"
        "nav content";
    }
    .zerotohero-layout.with-nav:not(.wide) {
      grid-template-rows: auto 1fr auto;
      grid-template-areas:
        "topbar"
        "content"
        "nav";
    }
  }
}

#zerotohero {
  .zerotohero-layout:not(.with-nav) {
    grid-template-rows: auto 1fr;
    grid-template-columns: 1fr;
    grid-template-areas:
      "topbar"
      "content";
  }
}


</style>
