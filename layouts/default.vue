<script lang="javascript">
import Config from "@/lib/config";
import smoothscroll from "smoothscroll-polyfill";
import Helper from "@/lib/helper";
import { mapState } from "vuex";

export default {
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
      fullHistory: [],
      collapsed: false,
      overlayPlayerYouTubeId: undefined,
      overlayPlayerLesson: undefined,
      l2Time: {},
      zoomLevel: 0,
      timeLoggerID: undefined,
      // transition: false,
      // edgeDetected: false,
      // translateX: 0,
    };
  },
  computed: {
    ...mapState("settings", ["l2Settings", "l1", "l2"]),
    ...mapState("history", ["history"]),
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
      };
      classes[`route-${this.$route.name}`] = true;
      classes[`zerotohero-zoom-${this.zoomLevel}`] = true;
      if (this.l1 && this.l2) {
        this.l1, this.l2;
        classes = Object.assign(classes, {
          "show-pinyin": this.l2Settings.showPinyin,
          "show-pinyin-for-saved":
            !this.l2Settings.showPinyin && this.l2 && this.l2.han,
          "show-simplified": !this.l2Settings.useTraditional,
          "show-traditional": this.l2Settings.useTraditional,
          "show-definition": this.l2Settings.showDefinition,
          "show-translation": this.l2Settings.showTranslation,
          "show-byeonggi": this.l2Settings.showByeonggi,
          "use-serif": this.l2Settings.useSerif,
        });
        classes[`l1-${this.l1.code}`] = true;
        classes[`l2-${this.l2.code}`] = true;
        if (this.l2.han) classes["l2-zh"] = true;
        if (this.l2.han) classes["l2-zh"] = true;
      }
      return classes;
    },
    background() {
      return Helper.background(this.l2);
    },
  },
  created() {
    this.$nuxt.$on("history", this.addFullHistoryItem); // from Language map
    this.$nuxt.$on("animateStar", this.onAnimateStar);
    if (typeof window !== "undefined")
      window.addEventListener("resize", this.onResize);
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
    await this.initAndGetUserData(); // Make sure user data is fetched from the server
    console.log("Default.vue: User data initialized.");
    if (this.l1 && this.l2) {
      this.loadLanguageSpecificSettings(); // Make sure this line is AFTER registering mutation event listeners above!
      this.onLanguageChange();
    }
    this.onAllLanguagesLoaded();
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
    if (typeof this.l2 !== "undefined" && this.l2.code === "my") {
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
      this.addFullHistoryItem(this.$route.path);
      if (
        this.$route.name === "youtube-view" &&
        this.$route.params.youtube_id
      ) {
        this.overlayPlayerYouTubeId = this.$route.params.youtube_id;
        this.overlayPlayerLesson = this.$route.params.lesson;
      }
    },
    "$auth.user"() {
      this.initAndGetUserData();
    },
  },
  methods: {
    onZoom(zoomLevel) {
      this.zoomLevel = zoomLevel;
    },
    overlayPlayerClose(youtube_id) {
      this.overlayPlayerYouTubeId = undefined;
      this.overlayPlayerLesson = undefined;
      this.fullHistory = this.fullHistory.filter(
        (path) => !path.includes(`/youtube/view/${youtube_id}`)
      ); // If the user closes the youtube overlay player, we should never go back to it in history
    },
    subscribeToVuexMutations() {
      this.unsubscribe = this.$store.subscribe((mutation) => {
        if (mutation.type === "shows/LOAD_SHOWS") {
          this.$store.dispatch("stats/load", {
            l2: this.l2,
            adminMode: this.$store.state.settings.adminMode,
          });
        }
        if (mutation.type.startsWith("settings")) {
          if (mutation.type === "settings/SET_L1") {
            this.updatei18n();
          }
          if (mutation.type === "settings/SET_L2") {
            this.loadLanguageSpecificSettings();
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
          this.l2Time[this.l2.code] = this.$store.getters["progress/time"](
            this.l2
          );
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
      this.l2Time[this.l2.code] = this.$store.getters["progress/time"](this.l2);
      console.log(
        `🕙 Language changed to ${this.l2.code}, timer restarted from ${
          this.l2Time[this.l2.code] / 1000
        } seconds.`
      );
      this.startLoggingUserTime();
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
    // Initialize the user data record if there isn't one
    async createNewUserDataRecord(token, payload = {}) {
      let res = await this.$authios
        .post(`${Config.wiki}items/user_data`, payload)
        .catch((err) => {
          console.log(
            "Axios error in savedWords.js: err, url, payload",
            err,
            url,
            payload
          );
        });
      if (res && res.data && res.data.data) {
        let userDataId = res.data.data.id;
        return userDataId;
      }
    },
    async initAndGetUserData() {
      if (this.$auth && this.$auth.loggedIn) {
        let user = this.$auth.user;
        let token = this.$auth.strategy.token.get()
          ? this.$auth.strategy.token.get().replace("Bearer ", "")
          : undefined;
        if (user) {
          if (!token) {
            await this.$auth.setUser(null); // Remind the user that they no longer have credentials
            this.$toast.error(`Sorry, but you need to login again.`, {
              position: "top-center",
              duration: 5000,
            });
            this.$router.push({
              name: "login",
              params: { l1: this.$l1.code, l2: this.$l2.code },
            });
          } else {
            document.cookie = "directus-zerotohero-session=" + token;
            token = token.replace("Bearer ", "");
            let userDataRes = await axios
              .get(
                `${Config.wiki}items/user_data?filter[owner][eq]=${
                  user.id
                }&timestamp=${Date.now()}`,
                { headers: { Authorization: `Bearer ${token}` } }
              )
              .catch(async (err) => {
                Helper.logError(err);
              });
            if (userDataRes && userDataRes.data && userDataRes.data.data) {
              if (userDataRes.data.data[0]) {
                let { id, saved_words, saved_phrases, history, progress } =
                  userDataRes.data.data[0];
                this.$auth.$storage.setUniversal("dataId", id);
                this.$store.dispatch("savedWords/importFromJSON", saved_words);
                this.$store.dispatch(
                  "savedPhrases/importFromJSON",
                  saved_phrases
                );
                this.$store.dispatch("history/importFromJSON", history);
                this.$store.dispatch("progress/importFromJSON", progress);
              } else {
                // No user data found, let's create it
                let dataId = await this.createNewUserDataRecord(token);
                this.$auth.$storage.setUniversal("dataId", dataId);
              }
            }
          }
        }
      } else {
        return false;
      }
    },
    async onAnimateStar(el) {
      let target = document.querySelector("#site-top-bar-saved-words");
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
        this.$store.commit("settings/SET_L1", l1);
        this.$store.commit("settings/SET_L2", l2);
      }
    },
    addFullHistoryItem(path) {
      this.fullHistory.push(path);
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
      this.fullHistory = this.fullHistory.filter(h => h.includes(`/${this.l1.code}/${this.l2.code}`))
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
      if (!this.$store.state.shows.showsLoaded[this.l2.code]) {
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

<template>
  <div id="zerotohero" :class="classes">
    <div
      class="zerotohero-background"
      :style="`background-image: url(${background})`"
      v-if="wide || !($route.params.l1 && $route.params.l1 && l1 && l2)"
    />
    <template
      v-if="
        $route.meta.layout === 'full' ||
        !($route.params.l1 && $route.params.l1 && l1 && l2)
      "
    >
      <Nuxt id="main" />
    </template>
    <template v-else>
      <SiteTopBar
        v-if="!wide && $route.params.l1 && $route.params.l1 && l1 && l2"
        variant="menu-bar"
        :badge="savedWordsCount + savedPhrasesCount"
      />

      <Nav
        v-if="
          $route.params.l1 &&
          $route.params.l1 &&
          l1 &&
          l2 &&
          !(!wide && $route.name === 'youtube-view')
        "
        class="zth-nav-wrapper"
        :l1="l1"
        :l2="l2"
        :key="`nav-${l1.code}-${l2.code}`"
        :variant="wide ? 'side-bar' : 'menu-bar'"
        :skin="$route.meta.skin ? $route.meta.skin : 'light'"
        :fullHistory="fullHistory"
        @collapsed="updateCollapsed"
        :showMainNav="wide"
        mode="pill"
      />

      <Nav
        v-if="$route.params.l1 && $route.params.l1 && l1 && l2 && !wide"
        :l1="l1"
        :l2="l2"
        :key="`nav-bottom-${l1.code}-${l2.code}`"
        variant="menu-bar"
        :skin="$route.meta.skin ? $route.meta.skin : 'light'"
        :fullHistory="fullHistory"
        @collapsed="updateCollapsed"
        :showLogo="false"
        :showMainNav="true"
        :showSecondaryNav="false"
        :bottom="true"
        mode="small-icon"
        style="z-index: 10"
      />
      <div class="zth-content">
        <!-- These touch events block scrolling from iOS! -->
        <!-- v-hammer:panstart.horizontal="onPanStart"
        v-hammer:pan.horizontal="onPan" -->
        <Nuxt id="main" v-if="$route.name !== 'youtube-view'" />
        <!-- <LazyFooter
          v-if="dictionaryCredit"
          :dictionaryCredit="dictionaryCredit"
          class="zth-footer"
        /> -->
        <YouTubeViewComp
          id="overlay-player"
          v-if="overlayPlayerYouTubeId"
          v-bind="{
            youtube_id: overlayPlayerYouTubeId,
            lesson: overlayPlayerLesson,
            mini: overlayPlayerMinimized,
            fullHistory,
            class: `${
              overlayPlayerMinimized ? 'overlay-player-minimized' : ''
            }`,
            key: `youtube-view-comp-${overlayPlayerYouTubeId}`,
          }"
          @close="overlayPlayerClose"
        />
      </div>
    </template>
    <i class="fas fa-star star-animation"></i>
  </div>
</template>

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
      background: rgba(0, 0, 0, 0.8);
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
}

.zerotohero-wide #overlay-player.overlay-player-minimized {
  bottom: 0;
}

#zerotohero {
  min-height: 100vh;
  &.zerotohero-dark .zth-content {
    background: black;
  }
  .zerotohero-background {
    height: 100vh;
    width: 100vw;
    background-color: #000;
    background-attachment: initial;
    background-position: center;
    background-size: cover;
    z-index: -1;
    position: fixed;
    top: 0;
    left: 0;
  }
  .zth-content {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    #main {
      flex: 1;
    }
  }
}

.zerotohero-wide {
  height: 100%;
  .zth-content {
    flex: 1;
    margin-left: 13rem;
    overflow: visible;
    width: calc(100% - 13rem);
  }
  .zth-nav-wrapper.has-secondary-nav + .zth-content {
    margin-left: 26rem;
    width: calc(100% - 26rem);
  }
  &.zerotohero-wide-collapsed {
    .zth-content {
      margin-left: 4.5rem;
      width: calc(100% - 4.5rem);
    }
    .zth-nav-wrapper.has-secondary-nav + .zth-content {
      margin-left: 9rem;
      width: calc(100% - 9rem);
    }
  }
}

@media screen and (max-device-width: 1024px) {
  .zth-nav-wrapper {
    background-attachment: scroll;
  }
}

.zth-footer {
  background-color: #25242cfa;
  color: white;
}
</style>
