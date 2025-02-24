<template>
  <div
    :class="{
      'video-view': true,
      'video-view-minimized': size === 'mini',
      [`skin-${$skin}`]: true,
    }"
  >
    <SocialHead
      v-if="this.type === 'bring-your-own'"
      :title="`Play Your Own Video | Learn ${$l2.name} with Language Player`"
      description="Study the transcript of this video with a popup dictionary"
    />
    <div
      :class="`toggle-wrapper ${size !== 'mini' ? 'maximized' : 'minimized'}`"
      v-if="size === 'mini'"
    >
      <router-link
        :class="`btn btn-unstyled ${
          size !== 'mini' ? 'btn-maximize-toggle' : 'btn-minimize-toggle'
        }`"
        :to="minimizeToggleRouterLinkTo"
      >
        <i class="fas fa-chevron-down" v-if="size !== 'mini'"></i>
        <i class="fas fa-chevron-up" v-if="size === 'mini'"></i>
      </router-link>
      <b-button variant="unstyled" class="btn-close" @click="close">
        <i class="fa fa-times"></i>
      </b-button>
    </div>
    <div
      :class="{
        'video-view-content': true,
        'video-view-landscape': landscape,
        'subtitles-mode': mode === 'subtitles',
      }"
    >
      <component
        :is="currentComponent"
        v-bind="{
          youtube_id,
          directus_id,
          lesson,
          mini,
          skin: $skin,
          initialMode: mode,
          landscape,
          starttime,
          showQuiz
        }"
        @updateLayout="onUpdateLayout"
        @videoLoaded="onVideoLoaded"
        style="height: 100%"
        class="video-view-content-inner"
      />
    </div>
  </div>
</template>

<script>
import { scrollToTargetAdjusted, wide, DEFAULT_PAGE } from "../lib/utils";

export default {
  props: {
    type: {
      default: "youtube", // or 'bring-your-own'
    },
    youtube_id: {
      type: String,
      required: false,
    },
    directus_id: {
      type: Number,
      required: false,
    },
    lesson: {
      type: String, // If the video is a "lesson video" (with lesson vocab highlighted), set this to "lesson"
      required: false,
    },
    mini: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  data() {
    return {
      currentTime: 0,
      initialMode: this.$adminMode ? "transcript" : "subtitles",
      mountedDone: false,
      starttime: 0,
      video: undefined,
      duration: undefined,
    };
  },
  computed: {
    showQuiz() {
      return this.$l2Settings?.showQuiz;
    },
    currentComponent() {
      switch (this.type) {
        case "youtube":
          return "YouTubeViewComp";
        case "bring-your-own":
          return "BringYourOwnViewComp";
        default:
          return "YouTubeViewComp";
      }
    },
    fullHistoryPathsByL1L2() {
      return this.$store.getters["fullHistory/fullHistoryPathsByL1L2"]({
        l1: this.$l1,
        l2: this.$l2,
      });
    },
    landscape() {
      if (this.forcePortrait) return false;
      if (process.browser && this.viewportWidth && this.viewportHeight) {
        let landscape = this.viewportWidth > this.viewportHeight;
        return landscape;
      }
    },
    /**
     * The router link that we send the user to when they close the player.
     */
    maximizeVideoTo() {
      return {
        name: "l1-l2-video-view-type",
        params: {
          type: this.type,
        },
        query: {
          v: this.youtube_id,
          id: this.directus_id,
          lesson: this.lesson,
        },
      };
    },
    minimizeVideoTo() {
      if (this.fullHistoryPathsByL1L2) {
        let fullHistoryReversed = [...this.fullHistoryPathsByL1L2].reverse();
        let lastNonYouTubeViewPath = fullHistoryReversed.find(
          (h) =>
            !h.includes("video-view") &&
            h.includes(this.$l1.code + "/" + this.$l2.code) // Must be the same language!
        );
        if (lastNonYouTubeViewPath) return lastNonYouTubeViewPath;
        else return { name: DEFAULT_PAGE };
      }
      return { name: DEFAULT_PAGE };
    },
    minimizeToggleRouterLinkTo() {
      return this.mini ? this.maximizeVideoTo : this.minimizeVideoTo;
    },
    size() {
      return this.mini ? "mini" : "regular";
    },
    mode() {
      return this.initialMode;
    },
    currentTimeInSeconds() {
      let t = Math.floor(this.currentTime / 10) * 10;
      return t;
    },
  },
  async created() {
    this.starttime = this.$route.query.t ? Number(this.$route.query.t) : 0;
  },
  beforeDestroy() {
    if (this.unsubscribe) this.unsubscribe();
  },
  mounted() {
    if (typeof this.$store.state.settings !== "undefined") {
      this.initialMode = this.$store.state.settings.mode;
    }
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("settings")) {
        this.initialMode = this.$store.state.settings.mode;
      }
    });
  },
  methods: {
    onVideoLoaded({ video, duration }) {
      this.video = video;
      this.duration = duration;
      if (this.layout !== "mini" && !wide()) {
        let el = this.$refs["youtube"];
        if (el) scrollToTargetAdjusted(el.$el, 43);
      }
      this.saveHistory({ type: this.type, video, duration });
    },
    close() {
      if (this.layout !== "mini") this.$router.push(this.minimizeVideoTo);
      this.$emit("close", { type: this.type, youtube_id: this.youtube_id });
    },
    onUpdateLayout(layout) {
      this.initialMode = layout;
    },
  },
};
</script>
<style lang="scss" scoped>
.video-view-minimized {
  &.skin-dark {
    background: #000000cc;
    border-top: 1px solid #ffffff44;
    .toggle-wrapper {
      .btn {
        color: #ccc;
      }
    }
  }
  &.skin-light {
    background: #e6e6e6cc;
    border-top: 1px solid #ddd;
    .toggle-wrapper {
      .btn {
        color: #444;
      }
    }
  }
}
.toggle-wrapper {
  height: 5rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 1rem;
  z-index: 10;
  position: fixed;
  right: 0;
  .btn {
    border-radius: 0;
  }
  &.maximized {
    top: 0;
    width: 100%;
    right: 0;
    height: 4rem;
    .btn {
      background: rgba(0, 0, 0, 0.8);
      padding: 0.6rem 1.3rem;
    }
  }
}

.video-view-content {
  height: 100%;
}

.zerotohero-wide {
  :deep(.video-with-transcript-landscape) {
    .youtube {
      border-radius: 0.3rem 0.3rem 0 0;
      overflow: hidden;
    }
  }
}


.video-view {
  transition: all 1s ease-in-out;
  position: static;
  height: 100%;
  // overflow: scroll;
  &.video-view-minimized {
    position: fixed;
    border-radius: 0.25rem;
    height: 5rem;
    bottom: calc(env(safe-area-inset-bottom) + 4.88rem + 0.5rem);
    overflow: hidden;
    z-index: 9;
    backdrop-filter: blur(20px);
  }
}


.zerotohero-wide {
  .video-view-minimized {
    left: calc(13rem + 1rem);
    width: calc(100% - 13rem - 2rem);
    bottom: 1rem;
  }
}
.zerotohero-not-wide.zerotohero-with-nav {
  .video-view-minimized {
    left: 0.5rem;
    width: calc(100% - 1rem);
  }
}

:deep(.synced-transcript-single-line) .transcript-line {
  font-size: 2em;
}
</style>
