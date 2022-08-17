<template>
  <div id="zerotohero" :class="classes">
    <FeedbackButton />
    <!-- <delay-hydration> -->
    <!-- <HydrationNotice /> -->
    <client-only>
      <!-- Main nav - side bar on wide screen, bottom bar on small screen /-->
      <Nav
        v-if="$route.params.l1 && $route.params.l2 && l1 && l2"
        class="zth-main-nav-wrapper"
        :l1="l1"
        :l2="l2"
        :key="`nav-main-${l1.code}-${l2.code}`"
        :variant="wide ? 'side-bar' : 'bottom-bar'"
        :skin="$route.meta.skin ? $route.meta.skin : 'light'"
        @collapsed="updateCollapsed"
        level="main"
      />
    </client-only>
    <div class="zth-content">
      <client-only>
        <SiteTopBar
          v-if="showTopBar"
          :skin="$route.meta.skin ? $route.meta.skin : 'light'"
          variant="menu-bar"
          :badge="savedWordsCount + savedPhrasesCount"
          :wide="wide"
        />
        <!-- Secondary nav (hidden for youtube-view) /-->
        <Nav
          v-if="
            $route.params.l1 &&
            $route.params.l2 &&
            l1 &&
            l2 &&
            !($route.name === 'youtube-view')
          "
          class="zth-secondary-nav-wrapper"
          :l1="l1"
          :l2="l2"
          :key="`nav-secondary-${l1.code}-${l2.code}`"
          variant="menu-bar"
          level="secondary"
          :skin="$route.meta.skin ? $route.meta.skin : 'light'"
        />
      </client-only>
      <YouTubeViewComp
        id="overlay-player"
        v-if="overlayPlayerYouTubeId"
        v-bind="{
          youtube_id: overlayPlayerYouTubeId,
          lesson: overlayPlayerLesson,
          mini: overlayPlayerMinimized,
          class: `${overlayPlayerMinimized ? 'overlay-player-minimized' : ''}`,
          key: `youtube-view-comp-${overlayPlayerYouTubeId}`,
        }"
        @close="overlayPlayerClose"
      />
      <div id="main" v-if="overlayPlayerMinimized">
        <Nuxt class="nuxt-content" />
      </div>
    </div>

    <!-- </delay-hydration> -->
    <i class="fas fa-star star-animation"></i>
  </div>
</template>

<script lang="javascript">
import Config from "@/lib/config";
import smoothscroll from "smoothscroll-polyfill";
import Helper from "@/lib/helper";
import { mapState } from "vuex";
import { DelayHydration } from "nuxt-delay-hydration/dist/components";

export default {
  components: {
    DelayHydration,
  },
  data() {
    return {
      Config,
      focus: false,
      loaded: false,
      wide: false,
      skin: "light",
      dictionaryCredit: "",
      settingsLoaded: undefined,
      fullPageRoutes: ["index", "sale"],
      collapsed: false,
      overlayPlayerYouTubeId: undefined,
      overlayPlayerLesson: undefined,
      l2Time: {},
      zoomLevel: 0,
      timeLoggerID: undefined,
      host: process.server
        ? process.env.baseUrl
        : window.location.protocol +
          "//" +
          window.location.hostname +
          (window.location.port ? ':' + window.location.port : '')
      // transition: false,
      // edgeDetected: false,
      // translateX: 0,
    };
  },
  computed: {
    ...mapState("settings", ["l2Settings", "l1", "l2"]),
    ...mapState("history", ["history"]),
    ...mapState("fullHistory", ["fullHistory"]),
    showTopBar() {
      if (this.$route.meta && this.$route.meta.layout === 'full') return false
      else return this.$route.params.l1 && this.$route.params.l1 && this.l1 && this.l2
    },
    fullHistoryPathsByL1L2() {
      return this.$store.getters["fullHistory/fullHistoryPathsByL1L2"]({
        l1: this.l1,
        l2: this.l2,
      });
    },
    savedWordsCount() {
      let count = this.$store.getters["savedWords/count"]({ l2: this.l2.code });
      // eslint-disable-next-line vue/no-parsing-error
      return count;
    },
    savedPhrasesCount() {
      let count = this.$store.getters["savedPhrases/count"]({
        l2: this.l2.code,
      });
      // eslint-disable-next-line vue/no-parsing-error
      return count;
    },
    overlayPlayerMinimized() {
      return this.$route.name !== "youtube-view";
    },
    classes() {
      let classes = {
        "zerotohero-wide": this.wide,
        "zerotohero-not-wide": !this.wide,
        "zerotohero-wide-collapsed": this.collapsed,
        "zerotohero-dark": this.$route.meta && this.$route.meta.skin === "dark",
        "zerotohero-light":
          this.$route.meta && this.$route.meta.skin === "light",
        "zerotohero-with-mini-player":
          this.overlayPlayerYouTubeId && this.overlayPlayerMinimized,
        "zerotohero-with-nav":
          this.$route.params.l1 && this.$route.params.l2 && this.l1 && this.l2,
      };
      classes[`route-${this.$route.name}`] = true;
      classes[`zerotohero-zoom-${this.zoomLevel}`] = true;
      if (
        this.$route.params.l1 &&
        this.$route.params.l2 &&
        this.l1 &&
        this.l2
      ) {
        this.l1, this.l2;
        classes["zerotohero-with-nav"] = true;
        let l2Settings
        if (this.l2Settings) l2Settings = this.l2Settings[this.l2.code];
        if (l2Settings) {
          classes = Object.assign(classes, {
            "show-pinyin": l2Settings.showPinyin,
            "show-pinyin-for-saved":
              !l2Settings.showPinyin && this.l2 && this.l2.han,
            "show-simplified": !l2Settings.useTraditional,
            "show-traditional": l2Settings.useTraditional,
            "show-definition": l2Settings.showDefinition,
            "show-translation": l2Settings.showTranslation,
            "show-byeonggi": l2Settings.showByeonggi,
            "use-serif": l2Settings.useSerif
          });
        }
        classes[`l1-${this.l1.code}`] = true;
        classes[`l2-${this.l2.code}`] = true;
        if (this.l2.han) classes["l2-zh"] = true;
        if (this.l2.han) classes["l2-zh"] = true;
      }
      return classes;
    }
  },
  created() {
    this.$nuxt.$on("history", this.addFullHistoryItem); // from Language map
    this.$nuxt.$on("animateStar", this.onAnimateStar);
    if (this.$route.name === "youtube-view") {
      this.overlayPlayerYouTubeId = this.$route.params.youtube_id;
      this.overlayPlayerLesson = this.$route.params.lesson;
    }
  },
  async mounted() {
    $nuxt.$on("zoom", this.onZoom);
    this.subscribeToVuexMutations();
    this.wide = Helper.wide();
    smoothscroll.polyfill(); // Safari does not support smoothscroll
    if (!this.$store.state.history.historyLoaded) {
      this.$store.dispatch("history/load");
    }
    await this.$directus.initAndGetUserData(); // Make sure user data is fetched from the server
    console.log("Default.vue: User data initialized.");
    if (this.l1 && this.l2) {
      this.loadLanguageSpecificSettings(); // Make sure this line is AFTER registering mutation event listeners above!
      this.onLanguageChange();
    }
    this.onAllLanguagesLoaded();
    if (this.$auth.loggedIn && this.$route.path === "/") {
      this.$router.push({ path: "/dashboard" });
    } else {
      if (window)
        this.addFullHistoryItem(
          window.location.pathname + window.location.search
        );
    }
    if (typeof window !== "undefined")
      window.addEventListener("resize", this.onResize);
  },
  beforeDestroy() {
    // you may call unsubscribe to stop the subscription
    this.unsubscribe();
  },
  destroyed() {
    if (typeof window !== "undefined")
      window.removeEventListener("resize", this.onResize);
  },
  head() {
    let head = { script: [] };
    if (this.l2 && this.l2.code === "my") {
      head.script.push({
        src: "/vendor/myanmar-tools/zawgyi_converter.min.js",
        body: true,
      });
      head.script.push({
        src: "/vendor/myanmar-tools/zawgyi_detector.min.js",
        body: true,
      });
    }
    return head;
  },
  watch: {
    l2() {
      this.onLanguageChange();
    },
    $route() {
      this.addFullHistoryItem(this.$route.fullPath);
      if (
        this.$route.name === "youtube-view" &&
        this.$route.params.youtube_id
      ) {
        this.overlayPlayerYouTubeId = this.$route.params.youtube_id;
        this.overlayPlayerLesson = this.$route.params.lesson;
      }
    },
    "$auth.user"() {
      this.$directus.initAndGetUserData();
    },
  },
  methods: {
    onZoom(zoomLevel) {
      this.zoomLevel = zoomLevel;
    },
    overlayPlayerClose(youtube_id) {
      this.overlayPlayerYouTubeId = undefined;
      this.overlayPlayerLesson = undefined;
      // TODO
      // If the user closes the youtube overlay player, we should never go back to it in history
    },
    subscribeToVuexMutations() {
      this.unsubscribe = this.$store.subscribe((mutation) => {
        if (mutation.type.startsWith("settings")) {
          if (mutation.type === "settings/SET_L1_L2") {
            this.updatei18n();
            this.loadLanguageSpecificSettings();
            this.$store.dispatch("settings/resetShowFilters");
            if (this.$route.name !== "youtube-view")
              this.overlayPlayerYouTubeId = undefined; // Close the mini player when switching languages
          }
        }
        if (
          mutation.type === "progress/LOAD" ||
          mutation.type === "progress/IMPORT_FROM_JSON"
        ) {
          if (this.l2) {
            this.l2Time[this.l2.code] = this.$store.getters["progress/time"](
              this.l2
            );
            this.startLoggingUserTime();
          }
        }
        if (mutation.type === "progress/SET_TIME") {
          if (this.l2) {
            this.l2Time[this.l2.code] = this.$store.getters["progress/time"](
              this.l2
            );
          }
        }
        if (mutation.type === "shows/LOAD_SHOWS") {
          if (this.l2) {
            if (!this.$store.state.stats.statsLoaded[this.l2.code]) {
              this.$store.dispatch("stats/load", {
                l2: this.l2,
                adminMode: this.$store.state.settings.adminMode,
              });
            }
          }
        }
      });
    },
    startLoggingUserTime() {
      if (this.timeLoggerID) return;
      this.timeLoggerID = setInterval(() => {
        if (!this.isAppIdle && this.l2) {
          if (!this.l2Time[this.l2.code]) this.l2Time[this.l2.code] = 0;
          this.l2Time[this.l2.code] += 1000;
          // Log user's time on site every 60 seconds
          if (this.l2Time[this.l2.code] % 15000 === 0) {
            this.$store.dispatch("progress/setTime", {
              l2: this.l2,
              time: this.l2Time[this.l2.code],
              autoLog: true,
            });
          }
        }
      }, 1000);
      console.log("🕙 Timer started!", { loggerID: this.timeLoggerID });
    },
    stopAndRestartLoggingUserTimeOnLanguageChange() {
      clearInterval(this.timeLoggerID);
      this.timeLoggerID = undefined;
      if (this.l2) {
        this.l2Time[this.l2.code] = this.$store.getters["progress/time"](
          this.l2
        );
        console.log(
          `🕙 Language changed to ${this.l2.code}, timer restarted from ${
            this.l2Time[this.l2.code] / 1000
          } seconds.`
        );
        this.startLoggingUserTime();
      }
    },
    onPanStart(e) {
      if (e.center.x > window.innerWidth * 0.9) this.edgeDetected = "right";
      if (e.center.x < window.innerWidth * 0.1) this.edgeDetected = "left";
    },
    async onPan(e) {
      let { deltaX, isFirst, isFinal } = e;
      if (this.edgeDetected) {
        this.translateX = deltaX;
      }
      if (isFinal) {
        if (deltaX < 0 && this.edgeDetected === "right") {
          console.log("FORWARD");
          this.transition = true;
          this.translateX = -1 * window.innerWidth;
          await Helper.timeout(500);
          this.transition = false;
          this.$router.forward();
          this.translateX = 0;
        }
        if (deltaX > 0 && this.edgeDetected === "left") {
          console.log("BACK");
          this.transition = true;
          this.translateX = window.innerWidth;
          await Helper.timeout(500);
          this.transition = false;
          this.$router.back();
          this.translateX = 0;
        }
        this.edgeDetected = false;
      }
    },
    async onAnimateStar(el) {
      let target = document.querySelector(".saved-words-count");
      if (el && target) {
        let bounds = el.getBoundingClientRect();
        let targetBounds = target.getBoundingClientRect();
        let x = targetBounds.left - bounds.left;
        let y = targetBounds.bottom - bounds.bottom;
        const starAnimation = [
          {
            transform: `scale(2.2) translateX(0px) translateY(0px) rotate(0)`,
            opacity: 1,
          },
          {
            transform: `scale(1) translateX(${x}px) translateY(${y}px) rotate(360deg)`,
            opacity: 0.7,
          },
        ];
        const star = document.querySelector(".star-animation");
        star.style.display = "block";
        star.style.top = bounds.top + "px";
        star.style.left = bounds.left + "px";
        star.animate(starAnimation, {
          duration: 1000,
          iterations: 1,
        });
        await Helper.timeout(1000);
        star.style.display = "none";
      }
    },
    updateCollapsed(collapsed) {
      this.collapsed = collapsed;
    },
    onAllLanguagesLoaded() {
      if (this.l1 && this.l2) {
        let l1 = this.$languages.getSmart(this.l1.code);
        let l2 = this.$languages.getSmart(this.l2.code);
        this.$store.commit("settings/SET_L1_L2", { l1, l2 });
      }
    },
    addFullHistoryItem(path) {
      this.$store.dispatch("fullHistory/add", path);
    },
    onSkin(skin) {
      this.skin = skin;
    },
    onResize() {
      this.wide = Helper.wide();
    },
    updatei18n() {
      this.$i18n.locale = this.l1.code;
      this.$i18n.silentTranslationWarn = true;
      if (this.l1.translations) {
        this.$i18n.setLocaleMessage(this.l1.code, this.l1.translations);
      }
    },
    async onLanguageChange() {
      if (this.l1) this.updatei18n();
      let dictionary = await this.$getDictionary();
      if (dictionary) {
        this.dictionaryCredit = await dictionary.credit();
      }
      this.stopAndRestartLoggingUserTimeOnLanguageChange();
    },
    loadLanguageSpecificSettings() {
      if (this.settingsLoaded === this.l2.code) return;
      this.settingsLoaded = this.l2.code;
      this.$store.dispatch("settings/load");
      if (!this.$store.state.savedWords.savedWordsLoaded) {
        this.$store.dispatch("savedWords/load");
      }
      if (!this.$store.state.savedPhrases.savedPhrasesLoaded) {
        this.$store.dispatch("savedPhrases/load");
      }
      if (!this.$store.state.progress.progressLoaded) {
        this.$store.dispatch("progress/load");
      }
      if (!this.$store.state.savedCollocations.savedCollocationsLoaded) {
        this.$store.commit("savedCollocations/LOAD_SAVED_COLLOCATIONS");
      }
      if (!this.$store.state.savedHits.savedHitsLoaded) {
        this.$store.commit("savedHits/LOAD_SAVED_HITS");
      }
      if (
        !(
          this.$store.state.shows.showsLoaded[this.l2.code] &&
          this.$store.state.tvShows &&
          this.$store.state.tvShows[this.l2.code].length > 0 &&
          this.$store.state.talks &&
          this.$store.state.talks[this.l2.code].length > 0
        )
      ) {
        this.$store.dispatch("shows/load", {
          l2: this.l2,
          adminMode: this.$store.state.settings.adminMode,
        });
      }
      if (!this.$store.state.phrasebooks.phrasebooksLoaded[this.l2.code]) {
        this.$store.dispatch("phrasebooks/load", {
          l2: this.l2,
          adminMode: this.$store.state.settings.adminMode,
        });
      }
    },
  },
};
</script>



<style lang="scss" scoped>
.transition {
  transition: 0.5s all ease-in-out;
}
.__nuxt-error-page {
  z-index: 99;
}

.star-animation {
  color: #f8b61e;
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 9999;
  width: 1.2rem;
  height: 1.2rem;
  display: none;
}

#overlay-player {
  min-height: 100vh;
  background: black;
  &.overlay-player-minimized {
    background: none;
    position: fixed;
    height: 5rem;
    min-height: 0;
    bottom: calc(env(safe-area-inset-bottom) + 4.88rem);
    top: inherit;
    overflow: hidden;
    z-index: 9;
    ::v-deep .main-dark {
      background: #28a74588;
      backdrop-filter: blur(20px);
    }
  }
}

.zerotohero-wide {
  .overlay-player-minimized {
    width: inherit;
  }
}
.zerotohero-not-wide {
  .overlay-player-minimized {
    width: 100%;
  }
  &:not(.route-youtube-view):not(.route-learning-path) .zth-content {
    padding-bottom: 5rem;
  }
}

.zerotohero-wide #overlay-player.overlay-player-minimized {
  bottom: 0;
}

#zerotohero {
  min-height: 100vh;
  &.zerotohero-light {
    background: white;
  }
  &.zerotohero-dark {
    background: black;
  }
  .zth-content {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
}

#zerotohero {
  #main {
    min-height: calc(100vh - 250px);
    flex: 1;
  }
}

.zerotohero-with-mini-player {
  .zth-content {
    padding-bottom: 5rem;
  }
}

.zerotohero-wide {
  height: 100%;
  &.zerotohero-with-nav {
    .zth-content {
      margin-left: 13rem;
      width: calc(100% - 13rem);
    }
    &.zerotohero-wide-collapsed {
      .zth-content {
        margin-left: 5rem;
        width: calc(100% - 5rem);
      }
    }
  }
  .zth-content {
    flex: 1;
    overflow: visible;
  }
}

@media screen and (max-device-width: 1024px) {
  .zth-main-nav-wrapper {
    background-attachment: scroll;
  }
}

.zth-footer {
  background-color: #25242cfa;
  color: white;
}

</style>
