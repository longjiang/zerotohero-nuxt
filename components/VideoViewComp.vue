
<template>
  <component
    :is="currentComponent"
    v-bind="{ youtube_id, lesson, mini, initialLayout, landscape }"
    @currentTime="updateCurrentTimeQueryString"
    @onUpdateLayout="onYouTubeUpdateLayout"
    @videoLoaded="onVideoLoaded"
  />
</template>

<script>
import DateHelper from "@/lib/date-helper";
export default {
  props: {
    type: {
      default: "youtube", // or 'bring-your-own'
    },
    youtube_id: {
      type: String,
      required: true,
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
      initialLayout: this.$adminMode ? "horizontal" : "vertical",
      mountedDone: false,
      starttime: 0,
      video: undefined,
      duration: undefined,
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
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
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
        name: "video-view",
        params: {
          type: "youtube",
          youtube_id: this.youtube_id,
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
        else return { name: "explore-media" };
      }
      return { name: "explore-media" };
    },
    minimizeToggleRouterLinkTo() {
      return this.mini ? this.maximizeVideoTo : this.minimizeVideoTo;
    },
    layout() {
      return this.mini ? "mini" : this.initialLayout;
    },
    currentTimeInSeconds() {
      let t = Math.floor(this.currentTime / 10) * 10;
      return t;
    },
  },
  async fetch() {
    this.starttime = this.$route.query.t ? Number(this.$route.query.t) : 0;
  },
  destroyed() {
    this.unbindKeys();
  },
  beforeDestroy() {
    if (this.unsubscribe) this.unsubscribe();
  },
  mounted() {
    if (typeof this.$store.state.settings !== "undefined") {
      this.initialLayout = this.$store.state.settings.layout;
    }
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("settings")) {
        this.initialLayout = this.$store.state.settings.layout;
      }
    });
  },
  methods: {
    onVideoLoaded({ video, duration }) {
      this.video = video;
      this.duration = duration;
      this.saveHistory({ type: this.type, video, duration });
    },
    close() {
      if (this.layout !== "mini") this.$router.push(this.minimizeVideoTo);
      this.$emit("close", { type: this.type, youtube_id: this.youtube_id });
    },
    onYouTubeUpdateLayout(layout) {
      this.initialLayout = layout;
    },
    updateCurrentTimeQueryString(currentTime) {
      if (typeof window !== "undefined") {
        this.currentTime = currentTime;
        const params = new URLSearchParams(window.location.search);
        const queryStringTime = params.get("t") ? Number(params.get("t")) : 0;
        if (this.currentTimeInSeconds !== queryStringTime) {
          window.history.replaceState(
            "",
            "",
            `?t=${this.currentTimeInSeconds}`
          );
          if (this.currentTimeInSeconds % 60 === 0)
            this.saveHistory({
              type: this.type,
              video: this.video,
              duration: this.duration,
            }); // Only update history (and push to the server) every minute
        }
      }
    },
    bindKeys() {
      window.onkeydown = (e) => {
        if (
          !["INPUT", "TEXTAREA"].includes(e.target.tagName.toUpperCase()) &&
          !e.metaKey &&
          !e.target.getAttribute("contenteditable")
        ) {
          if (e.code === "KeyM") {
            if (this.$refs.youtube && this.$refs.youtube.$refs.videoControls)
              this.$refs.youtube.$refs.videoControls.toggleSpeed();
            return false;
          }
          if (e.code === "Space") {
            this.$refs.youtube ? this.$refs.youtube.togglePaused() : "";
            return false;
          }
          if (["ArrowUp", "ArrowLeft"].includes(e.code)) {
            this.$refs.youtube.$refs.transcript.goToPreviousLine();
            return false;
          }
          if (["ArrowDown", "ArrowRight"].includes(e.code)) {
            this.$refs.youtube.$refs.transcript.goToNextLine();
            return false;
          }
          if (["KeyR"].includes(e.code)) {
            this.$refs.youtube.$refs.transcript.rewind();
            return false;
          }
        }
      };
    },
    saveHistory({ type, video, duration }) {
      if (type === "youtube" && video) {
        console.log(`YouTube View: Saving history...`);
        let data = {
          type: "video",
          id: `${this.$l2.code}-video-${video.youtube_id}`,
          date: DateHelper.unparseDate(new Date()),
          l1: this.$l1.code,
          l2: this.$l2.code,
          video: {
            id: video.id,
            title: video.title,
            youtube_id: video.youtube_id,
            starttime: this.currentTimeInSeconds,
          },
        };
        if (duration) {
          data.video.duration = durationn;
          data.video.progress = data.video.starttime / duration;
        }
        this.$store.dispatch("history/add", data); // history's ADD_HISTORY_ITEM mutation automatically checks if this item is already in the history based on it's id (e.g. zh-video-Y23x9L4)
      }
    },
    unbindKeys() {
      window.onkeydown = null;
    },
  },
  activated() {
    this.bindKeys();
  },
  deactivated() {
    this.unbindKeys();
  },
};
</script>
<style lang="scss" scoped>
.toggle-wrapper {
  color: white;
  height: 5rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 1rem;
  z-index: 10;
  position: fixed;
  right: 0;
  .btn {
    color: white;
    text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
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

.toggle-wrapper.maximized {
  top: calc(env(safe-area-inset-top) + 3rem);
}

.zerotohero-wide {
  .video-view-content {
    :deep(.youtube-with-transcript-landscape) {
      .youtube {
        border-radius: 0.3rem 0.3rem 0 0;
        overflow: hidden;

        .video-area {
          background: black;
        }
      }
    }
  }
}

.video-view-content {
  &.fullscreen {
    max-height: calc(100vh - 3rem - env(safe-area-inset-top));
    background-color: black;
    color: #ffffffaa;
    z-index: 21;
  }
}

.video-view {
  transition: all 1s ease-in-out;
  position: static;
  height: 100%;
  // overflow: scroll;
  &.video-view-minimized {
    position: fixed;
    height: 5rem;
    bottom: calc(env(safe-area-inset-bottom) + 4.88rem);
    overflow: hidden;
    z-index: 9;
    .main-dark {
      background: #000000aa;
      backdrop-filter: blur(20px);
    }
  }
}

.zerotohero-wide {
  .video-view-minimized {
    width: inherit;
  }
}
.zerotohero-not-wide.zerotohero-with-nav {
  .video-view-minimized {
    width: 100%;
  }
}

.zerotohero-wide #overlay-player.video-view-minimized {
  bottom: 0;
}
</style>
