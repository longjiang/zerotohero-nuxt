<template>
  <div id="zerotohero" :class="classes" :fullscreen="fullscreen">
    <MyLayout :wide="wide">
      <Nuxt
        :class="{
          'nuxt-content': true,
          [`skin-${$skin}`]: true,
        }"
      />
    </MyLayout>
    <i class="fas fa-star star-animation"></i>
  </div>
</template>

<script>
import smoothscroll from "smoothscroll-polyfill";
import MyLayout from "@/layouts/MyLayout.vue";
import { wide, timeout } from "@/lib/utils";
import { mapState } from "vuex";
import { DelayHydration } from "nuxt-delay-hydration/dist/components";

export default {
  components: {
    DelayHydration,
    MyLayout,
  },
  data() {
    return {
      wide: false,
      focus: false,
      loaded: false,
      dictionaryCredit: "",
      settingsLoaded: undefined,
      fullPageRoutes: ["index", "sale"],
      collapsed: false,
      l2Time: {},
      l2SettingsClasses: {},
      timeLoggerID: undefined,
      isElectron: false,
      isExtension: false,
      host: process.server
        ? process.env.baseUrl
        : window.location.protocol +
          "//" +
          window.location.hostname +
          (window.location.port ? ":" + window.location.port : ""),
    };
  },
  computed: {
    ...mapState("fullHistory", ["fullHistory"]),
    ...mapState("history", ["history", "historyLoaded"]),
    ...mapState("phrasebooks", ["phrasebooksLoaded"]),
    ...mapState("playlists", ["playlistsLoaded"]),
    ...mapState("progress", ["progressLoaded"]),
    ...mapState("savedCollocations", ["savedCollocationsLoaded"]),
    ...mapState("savedHits", ["savedHitsLoaded"]),
    ...mapState("savedPhrases", ["savedPhrasesLoaded"]),
    ...mapState("savedWords", ["savedWordsLoaded"]),
    ...mapState("settings", ["l2Settings", "fullscreen"]),
    ...mapState("shows", ["showsLoaded", "tvShows", "talks"]),
    ...mapState("stats", ["statsLoaded"]),
    combinedLanguages() {
      return `${this.$l1?.code}-${this.$l2?.code}`;
    },
    fullHistoryPathsByL1L2() {
      return this.$store.getters["fullHistory/fullHistoryPathsByL1L2"]({
        l1: this.$l1,
        l2: this.$l2,
      });
    },
    classes() {
      let classes = {
        "zerotohero-wide": this.wide,
        "zerotohero-not-wide": !this.wide,
        "zerotohero-wide-collapsed": this.collapsed,
        "zerotohero-with-mini-player":
          this.overlayPlayerYouTubeId && this.overlayPlayerMinimized,
        "zerotohero-with-nav":
          !this.fullscreen &&
          this.$route.params.l1 &&
          this.$route.params.l2 &&
          this.$l1 &&
          this.$l2 ? true : false,
        "zerotohero-electron": this.isElectron,
        "zerotohero-extension": this.isExtension,
        [`route-${this.$route.name}`]: true,
        [`zerotohero-${this.$skin}`]: true,
      };
      return Object.assign(classes, this.l2SettingsClasses);
    },
  },
  created() {
    this.$nuxt.$on("history", this.addFullHistoryItem); // from Language map
    this.$nuxt.$on("animateStar", this.onAnimateStar);
  },
  async mounted() {
    this.setClientEnvironment();
    this.subscribeToVuexMutations();
    await this.getUserDataAndSubscription();
    this.loadGeneralData();
    if (this.$l1 && this.$l2) {
      this.onLanguageChange();
    } else {
      this.redirectToDashboardIfAppropriate();
    }
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
    // Map languages to their respective scripts
    const scriptsMap = {
      my: {
        zawgyi_converter: "/vendor/myanmar-tools/zawgyi_converter.min.js",
        zawgyi_detector: "/vendor/myanmar-tools/zawgyi_detector.min.js",
      },
      ja: {
        wanakana: "/vendor/wanakana/wanakana.min.js",
        "map-kana": "/js/map-kana.js",
      },
    };

    // Check if the current language has associated scripts
    if (this.$l2?.code in scriptsMap) {
      // Transform the scripts into the needed format
      const scripts = Object.entries(scriptsMap[this.$l2.code]).map(
        ([hid, src]) => ({ hid, src, body: true })
      );

      const bodyClasses = this.isExtension ? "chrome-extension" : '';

      return {
        script: scripts,
        bodyAttrs: {
          class: bodyClasses
        },
      };
    }

    // If the current language has no associated scripts, return an empty array
    return {
      script: [],
    };
  },
  watch: {
    combinedLanguages() {
      this.onLanguageChange();
    },
    $route() {
      this.addFullHistoryItem(this.$route.fullPath);
    },
    "$auth.user"() {
      this.$directus.fetchOrCreateUserData();
    },
    $l2Settings: {
      deep: true,
      immediate: true,
      handler() {
        this.updateL2SettingsClasses();
      },
    },
  },
  methods: {
    loadGeneralData()  {
      if (!this.historyLoaded) {
        this.$store.dispatch("history/load");
      }
    },
    async getUserDataAndSubscription() {
      await this.$directus.fetchOrCreateUserData(); // Make sure user data is fetched from the server
      if (this.$auth.loggedIn) {
        await this.$store.dispatch(
          "subscriptions/checkSubscription",
          this.$auth.user.id
        );
      }
    },
    redirectToDashboardIfAppropriate() {
      if (this.$auth.loggedIn && this.$route.path === "/") {
        this.$router.push({ path: "/dashboard" });
      }
    },
    setClientEnvironment() {
      this.wide = wide();
      smoothscroll.polyfill(); // Safari does not support smoothscroll
      if (typeof window !== "undefined")
        window.addEventListener("resize", this.onResize);
      this.isElectron =
        navigator.userAgent.toLowerCase().indexOf(" electron/") > -1;
      this.isExtension = !!window.chrome.extension;
    },
    updateL2SettingsClasses() {
      if (
        this.$l1 &&
        this.$l2
      ) {
        this.$l1, this.$l2;
        let l2SettingsClasses = {};
        if (this.$l2Settings) {
          l2SettingsClasses = {
            "show-pinyin": this.$l2Settings.showPinyin,
            "show-pinyin-for-saved":
              !this.$l2Settings.showPinyin && this.$l2 && this.$l2.han,
            "show-simplified": !this.$l2Settings.useTraditional,
            "show-traditional": this.$l2Settings.useTraditional,
            "show-definition": this.$l2Settings.showDefinition,
            "show-translation": this.$l2Settings.showTranslation,
            "show-quick-gloss": this.$l2Settings.showQuickGloss,
            "show-byeonggi": this.$l2Settings.showByeonggi,
            "use-serif": this.$l2Settings.useSerif,
          };
          l2SettingsClasses[
            `zerotohero-zoom-${this.$l2Settings.zoomLevel}`
          ] = true;
        }
        l2SettingsClasses[`l1-${this.$l1.code}`] = true;
        l2SettingsClasses[`l2-${this.$l2.code}`] = true;
        if (this.$l2.han) l2SettingsClasses["l2-zh"] = true;
        this.l2SettingsClasses = l2SettingsClasses;
        this.classes;
      }
    },
    subscribeToVuexMutations() {
      this.unsubscribe = this.$store.subscribe((mutation) => {
        if (
          mutation.type === "progress/LOAD" ||
          mutation.type === "progress/IMPORT_FROM_JSON"
        ) {
          if (this.$l2) {
            this.l2Time[this.$l2.code] = this.$store.getters["progress/time"](
              this.$l2
            );
            this.startLoggingUserTime();
          }
        }
        if (mutation.type === "progress/SET_TIME") {
          if (this.$l2) {
            this.l2Time[this.$l2.code] = this.$store.getters["progress/time"](
              this.$l2
            );
          }
        }
        if (mutation.type === "shows/LOAD_SHOWS") {
          if (this.$l2) {
            if (!this.statsLoaded[this.$l2.code]) {
              this.$store.dispatch("stats/load", {
                l2: this.$l2,
                adminMode: this.$adminMode,
              });
            }
          }
        }
      });
    },
    startLoggingUserTime() {
      if (this.timeLoggerID) return;
      this.timeLoggerID = setInterval(() => {
        if (!this.isAppIdle && this.$l2) {
          if (!this.l2Time[this.$l2.code]) this.l2Time[this.$l2.code] = 0;
          this.l2Time[this.$l2.code] += 1000;
          // Log user's time on site every 2 minutes
          if (this.l2Time[this.$l2.code] % 15000 === 0) {
            this.$store.dispatch("progress/setTime", {
              l2: this.$l2,
              time: this.l2Time[this.$l2.code],
              autoLog: true,
            });
          }
        }
      }, 1000);
    },
    stopAndRestartLoggingUserTimeOnLanguageChange() {
      clearInterval(this.timeLoggerID);
      this.timeLoggerID = undefined;
      if (this.$l2) {
        this.l2Time[this.$l2.code] = this.$store.getters["progress/time"](
          this.$l2
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
          this.transition = true;
          this.translateX = -1 * window.innerWidth;
          await timeout(500);
          this.transition = false;
          this.$router.forward();
          this.translateX = 0;
        }
        if (deltaX > 0 && this.edgeDetected === "left") {
          this.transition = true;
          this.translateX = window.innerWidth;
          await timeout(500);
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
        await timeout(1000);
        star.style.display = "none";
      }
    },
    addFullHistoryItem(path) {
      this.$store.dispatch("fullHistory/add", path);
    },
    onSkin(skin) {
      this.skin = skin;
    },
    onResize() {
      this.wide = wide();
    },
    updatei18n() {
      this.$i18n.locale = this.$l1.code;
      this.$i18n.silentTranslationWarn = true;
      if (this.$l1.translations) {
        this.$i18n.setLocaleMessage(this.$l1.code, this.$l1.translations);
      }
    },
    async onLanguageChange() {
      let youtube = this.$refs["video-view-comp"];
      if (
        youtube &&
        youtube.video &&
        youtube.video.l2 !== String(this.$l2.id)
      ) {
        this.overlayPlayerClose(); // Close the mini player unless the language matches
      }
      this.stopAndRestartLoggingUserTimeOnLanguageChange();
      if (this.$l1) this.updatei18n();
      if (this.$l1 && this.$l2) {
        this.loadLanguageSpecificData(); // This will trigger updateL2SettingsClasses()
        let dictionary = await this.$getDictionary();
        await this.$getGrammar();
        if (dictionary) {
          this.dictionaryCredit = await dictionary.credit();
        }
      }
    },
    loadLanguageSpecificData() {
      if (this.settingsLoaded === this.$l2.code) return;
      this.settingsLoaded = this.$l2.code;
      this.$store.commit("settings/LOAD_SETTINGS", {
        l1: this.$l1,
        l2: this.$l2,
      });
      if (!this.savedWordsLoaded) {
        this.$store.dispatch("savedWords/load");
      }
      if (!this.savedPhrasesLoaded) {
        this.$store.dispatch("savedPhrases/load");
      }
      if (!this.progressLoaded) {
        this.$store.dispatch("progress/load");
      }
      if (!this.savedCollocationsLoaded) {
        this.$store.commit("savedCollocations/LOAD_SAVED_COLLOCATIONS");
      }
      if (!this.savedHitsLoaded) {
        this.$store.commit("savedHits/LOAD_SAVED_HITS");
      }
      if (
        !(
          this.showsLoaded[this.$l2.code] &&
          this.tvShows?.[this.$l2.code]?.length &&
          this.talks?.[this.$l2.code]?.length
        )
      ) {
        this.$store.dispatch("shows/load", {
          l2: this.$l2,
          forceRefresh: this.$adminMode,
        });
      }
      if (!this.phrasebooksLoaded[this.$l2.code]) {
        this.$store.dispatch("phrasebooks/load", {
          l2: this.$l2,
          adminMode: this.$adminMode,
        });
      }
      if (!this.playlistsLoaded[this.$l2.code]) {
        this.$store.dispatch("playlists/loadPlaylists", {
          l2: this.$l2,
          forceRefresh: true,
        });
      }
    },
  },
};
</script>

<style lang="scss">
@import "@/assets/scss/zerotohero.scss";

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
</style>
