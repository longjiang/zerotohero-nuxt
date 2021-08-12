<template>
  <div id="zerotohero" :class="classes">
    <div
      class="zerotohero-background"
      :style="`background-image: url(${background})`"
    />
    <template v-if="$route.path !== '/'">
      <client-only>
        <Nav
          v-if="l1 && l2"
          :l1="l1"
          :l2="l2"
          :key="`nav-${l1.code}-${l2.code}`"
          :variant="wide ? 'side-bar' : 'menu-bar'"
          class="zth-nav"
        />
      </client-only>
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
import Helper from "@/lib/helper";

export default {
  data() {
    return {
      Config,
      focus: false,
      loaded: false,
      wide: false,
      dictionaryCredit: "",
    };
  },
  async mounted() {
    this.wide = Helper.wide();
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
    if (!this.$store.state.savedWords.savedWordsLoaded) {
      this.$store.commit("savedWords/LOAD_SAVED_WORDS");
    }
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
      this.wide = Helper.wide();
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
      if (this.l1 && this.l2) {
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
      }
    },
    background() {
      if (!this.l2) return "/img/background-branch.jpg";
      else if (this.l2.code === "zh")
        return `/img/backgrounds/bg-zh-${Math.ceil(Math.random() * 10)}.jpg`;
      else return `https://source.unsplash.com/1600x900/?${this.l2.name}`;
    },
  },
};
</script>

<style lang="scss">
.__nuxt-error-page {
  z-index: 99;
}

#zerotohero {
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
}

.main {
  background: white;
}

.main-dark {
  background-color: hsl(0deg 0% 0% / 75%);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
}

.zth-nav {
  background: #002d4433;
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
}

.zerotohero-wide {
  height: 100%;
  .zth-nav {
    overflow: hidden;
    position: fixed;
    top: 0;
    left: 0;
    width: 13rem;
    height: 100vh;
    z-index: 2;
    &.has-secondary-nav {
      width: 26rem;
    }
  }
  .zth-content {
    flex: 1;
    margin-left: 13rem;
    overflow: visible;
  }
  .zth-nav.has-secondary-nav + .zth-content {
    margin-left: 26rem;
  }
}

@media screen and (max-device-width: 1024px) {
  .zth-nav {
    background-attachment: scroll;
  }
}

.zth-footer {
  background-color: #25242cfa;
  color: white;
}
.zerotohero-wide {
  .zth-footer {
    margin-left: -29rem;
    width: calc(100% + 29rem);
    padding: 3rem;
    padding-left: 32rem;
  }
  .main {
    padding: 0 3rem;
  }
}
</style>
