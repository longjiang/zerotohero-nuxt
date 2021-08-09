<template>
  <div id="zerotohero" :class="classes">
    <template v-if="$route.path !== '/'">
      <Nav
        v-if="l1 && l2"
        :l1="l1"
        :l2="l2"
        :key="`nav-${l1.code}-${l2.code}`"
        :variant="wide ? 'side-bar' : 'menu-bar'"
        class="zth-nav"
      />
      <div class="zth-content">
        <Nuxt id="main" />
        <footer class="zth-footer" style="z-index: -1">
          <Choose :compact="true" />
          <div class="container">
            <div class="row">
              <div class="col-sm-12">
                <div class="mt-5">
                  <p>
                    <strong>This is an open-source project.</strong>
                    This website is built on
                    <code>Vue.js</code>
                    and is fully open source. Check out the code on GitHub at
                    <a href="https://github.com/longjiang/zerotohero-nuxt">
                      https://github.com/longjiang/zerotohero-nuxt
                    </a>
                    .
                  </p>
                </div>
                <div class="mt-5">
                  <p class="mb-4">
                    <strong>Credits:</strong>
                    <span v-html="dictionaryCredit"></span>
                    The collocations and example sentences are provided by
                    <a target="_blank" href="https://www.sketchengine.eu/">
                      SketchEngine
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <ReaderComp
        v-if="l1 && l2 && $route.name !== 'youtube-view'"
        :iconMode="true"
      />
    </template>
    <template v-else>
      <Nuxt id="main" />
    </template>
  </div>
</template>

<script lang="javascript">
import Config from "@/lib/config";
import { mapState } from "vuex";
import smoothscroll from "smoothscroll-polyfill";

export default {
  data() {
    return {
      Config,
      focus: false,
      loaded: false,
      dictionaryCredit: "",
      wide: typeof window !== "undefined" && window.innerWidth > 991,
    };
  },
  async mounted() {
    if (this.l1 && this.l2) this.loadSettings();
    if (this.l1) this.updatei18n();
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
    this.$ga.page(this.$route.path);
    smoothscroll.polyfill(); // Safari does not support smoothscroll
    let dictionary = await this.$getDictionary();
    if (dictionary) {
      this.dictionaryCredit = await dictionary.credit();
    }
  },
  created() {
    if (typeof window !== "undefined")
      window.addEventListener("resize", this.onResize);
  },
  destroyed() {
    if (typeof window !== "undefined")
      window.removeEventListener("resize", this.onResize);
  },
  watch: {
    $route() {
      this.$ga.page(this.$route.path);
    },
  },
  methods: {
    onResize() {
      this.wide = typeof window !== "undefined" && window.innerWidth > 991;
    },
    updatei18n() {
      this.$i18n.locale = this.l1.code;
      this.$i18n.silentTranslationWarn = true;
      if (this.l1.translations) {
        this.$i18n.setLocaleMessage(this.l1.code, this.l1.translations);
      }
    },
    async loadSettings() {
      this.$store.commit("settings/LOAD_SETTINGS");
      if (!this.$store.state.savedWords.savedWordsLoaded) {
        this.$store.commit("savedWords/LOAD_SAVED_WORDS");
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
  computed: {
    ...mapState("settings", ["l2Settings", "l1", "l2"]),
    classes() {
      this.l1, this.l2;
      let classes = {
        "show-pinyin": this.l2Settings.showPinyin,
        "show-pinyin-for-saved":
          !this.l2Settings.showPinyin && this.l2 && this.l2.han,
        "show-simplified": !this.l2Settings.useTraditional,
        "show-traditional": this.l2Settings.useTraditional,
        "show-definition": this.l2Settings.showDefinition,
        "show-translation": this.l2Settings.showTranslation,
        "show-byeonggi": this.l2Settings.showByeonggi,
        "use-serif": this.l2Settings.useSerif,
        "zerotohero-wide": this.wide,
      };
      classes[`l1-${this.l1.code}`] = true;
      classes[`l2-${this.l2.code}`] = true;
      if (this.l2.han) classes["l2-zh"] = true;
      return classes;
    },
  },
};
</script>

<style lang="scss">
.__nuxt-error-page {
  z-index: 99;
}

.zerotohero-wide {
  display: flex;
  height: 100%;
  align-items: stretch;
  .zth-nav {
    overflow: hidden;
    background-image: url(/img/background-branch.jpg);
    background-attachment: fixed;
    background-position: center;
    background-size: cover;
    position: fixed;
    top: 0;
    left: 0;
    width: 29rem;
    height: 100vh;
    z-index: 2;
  }
  .zth-content {
    flex: 1;
    margin-left: 30rem;
  }
}

@media screen and (max-device-width: 1024px) {
  .zth-nav {
    background-attachment: scroll;
  }
}
</style>
