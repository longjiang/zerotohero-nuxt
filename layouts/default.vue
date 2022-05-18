<template>
  <div id="zerotohero" :class="classes">
    <div
      class="zerotohero-background"
      :style="`background-image: url(${background})`"
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
        v-if="$route.params.l1 && $route.params.l1 && l1 && l2"
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
      />
      <div class="zth-content">
        <Nuxt id="main" />
        <LazyFooter v-if="dictionaryCredit" :dictionaryCredit="dictionaryCredit" class="zth-footer" />
      </div>
      <ReaderComp
        v-if="
          wide &&
          l1 &&
          l2 &&
          $route.name !== 'youtube-view' &&
          $route.name !== 'home'
        "
        :iconMode="true"
      />
    </template>
    <i class="fas fa-star star-animation"></i>
  </div>
</template>

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
    };
  },

  computed: {
    ...mapState("settings", ["l2Settings", "l1", "l2"]),
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
    classes() {
      let classes = {
        "zerotohero-wide": this.wide,
        "zerotohero-not-wide": !this.wide,
        "zerotohero-wide-collapsed": this.collapsed,
      };
      classes[`route-${this.$route.name}`] = true;
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
  },
  async mounted() {
    this.wide = Helper.wide();
    smoothscroll.polyfill(); // Safari does not support smoothscroll
    if (this.l1 && this.l2) this.loadSettings();
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("settings")) {
        if (mutation.type === "settings/SET_L1") {
          this.updatei18n();
        }
        if (mutation.type === "settings/SET_L2") {
          this.loadSettings();
        }
      }
    });
    this.onLanguageChange();
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
    },
  },
  methods: {
    async onAnimateStar(el) {
      let target = document.querySelector("#site-top-bar-saved-words");
      if (el && target) {
        let bounds = el.getBoundingClientRect();
        let targetBounds = target.getBoundingClientRect();
        let x = targetBounds.left - bounds.left
        let y = targetBounds.bottom - bounds.bottom
        const starAnimation = [
          { transform: `scale(2.2) translateX(0px) translateY(0px) rotate(0)`, opacity: 1},
          { transform: `scale(1) translateX(${x}px) translateY(${y}px) rotate(360deg)`, opacity: 0.7 },
        ];
        const star = document.querySelector(".star-animation");
        star.style.display = 'block'
        star.style.top = bounds.top + 'px';
        star.style.left = bounds.left + 'px';
        star.animate(starAnimation, {
          duration: 1000,
          iterations: 1,
        });
        await Helper.timeout(1000)
        star.style.display = 'none'
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
      if (!this.$store.state.savedWords.savedWordsLoaded) {
        this.$store.dispatch("savedWords/load");
      }
      if (!this.$store.state.savedPhrases.savedPhrasesLoaded) {
        this.$store.dispatch("savedPhrases/load");
      }
      let dictionary = await this.$getDictionary();
      if (dictionary) {
        this.dictionaryCredit = await dictionary.credit();
      }
    },
    loadSettings() {
      if (this.settingsLoaded === this.l2.code) return;
      this.settingsLoaded = this.l2.code;
      this.$store.commit("settings/LOAD_SETTINGS");
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
      if (!this.$store.state.history.historyLoaded) {
        this.$store.dispatch("history/load");
      }
    },
  },
};
</script>

<style lang="scss" scoped>
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

#zerotohero {
  min-height: 100vh;
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
  &.zerotohero-not-wide:not(.route-index) {
    .zerotohero-background {
      display: none;
    }
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
  }
  .zth-nav-wrapper.has-secondary-nav + .zth-content {
    margin-left: 26rem;
  }
  &.zerotohero-wide-collapsed {
    .zth-content {
      margin-left: 4.5rem;
    }
    .zth-nav-wrapper.has-secondary-nav + .zth-content {
      margin-left: 9rem;
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
