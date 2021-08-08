<template>
  <div id="zerotohero" :class="classes">
    <template v-if="$route.path !== '/'">
      <template>
        <div class="container-fluid p-2 pl-3 site-top-bar" v-if="l1 && l2">
          <div class="container-fluid">
            <div
              class="row"
              style="display: flex; justify-content: space-between"
            >
              <div>
                <router-link to="/" class="link-unstyled">
                  <i class="fa fa-chevron-left mr-2"></i>
                  All Languages
                </router-link>
              </div>
              <div>
                <button
                  :class="['btn btn-unstyled', { 'd-none': !isPWA }]"
                  @click="share"
                  style="color: #ccc"
                >
                  <i class="fa fa-share"></i>
                </button>
                <button
                  :class="['btn btn-unstyled', { 'd-none': !isPWA }]"
                  @click="reload"
                  style="color: #ccc"
                >
                  <i class="fas fa-sync-alt"></i>
                </button>
                <a
                  v-if="l1.code === 'zh' && l2.code === 'en'"
                  class="link-unstyled nuxt-link-active btn-sign-in mr-1"
                  href="https://m.cctalk.com/inst/stevmab3"
                  target="_blank"
                >
                  登录
                  <img
                    src="/img/logo-cctalk-white.png"
                    class="logo-small ml-1"
                    data-not-lazy
                  />
                </a>
                <a
                  v-if="l1.code === 'en' && l2.code === 'zh'"
                  class="link-unstyled nuxt-link-active btn-sign-in mr-1"
                  href="https://sso.teachable.com/secure/133035/users/sign_in"
                  target="_blank"
                >
                  Login to
                  <img
                    src="/img/teachable_light.png"
                    class="logosp-small"
                    data-not-lazy
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div class="zth-header" v-if="l1 && l2">
          <div class="container-fluid pl-0 pr-0">
            <div class="container">
              <div class="row">
                <div class="col-sm-12 text-center">
                  <router-link
                    v-if="l1.code === 'en' && l2.code === 'zh'"
                    to="/en/zh/online-courses"
                  >
                    <img
                      src="/img/czh-logo-light.png"
                      alt="Chinese Zero to Hero"
                      style="max-width: 11rem; margin: 1.5rem 0"
                      class="logo"
                      data-not-lazy
                    />
                  </router-link>
                  <router-link
                    v-else-if="l1.code === 'zh' && l2.code === 'en'"
                    to="/zh/en/online-courses"
                  >
                    <img
                      src="/img/ezh-logo-light.png"
                      alt="Chinese Zero to Hero"
                      style="max-width: 11rem; margin: 1.5rem 0"
                      class="logo"
                      data-not-lazy
                    />
                  </router-link>
                  <LanguageLogo
                    v-else-if="l1 && l2"
                    :l1="l1"
                    :l2="l2"
                    style="margin: 2rem"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <Nav
          v-if="l1 && l2"
          :l1="l1"
          :l2="l2"
          :key="`nav-${l1.code}-${l2.code}`"
        />

        <Nuxt id="main" />

        <ReaderComp
          v-if="l1 && l2 && $route.name !== 'youtube-view'"
          :iconMode="true"
        />

        <footer class="bg-dark text-light pt-4 pb-4" style="z-index: -1">
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
      </template>
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
      classes: {},
      dictionaryCredit: "",
    };
  },
  async mounted() {
    if (this.l1 && this.l2) this.loadSettings();
    if (this.l1 && this.l2) this.updateClasses();
    if (this.l1) this.updatei18n();
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("settings")) {
        if (mutation.type === "settings/SET_L1") {
          this.updatei18n();
        }
        if (mutation.type === "settings/SET_L2") {
          this.loadSettings();
        }
        if (this.l1 && this.l2) this.updateClasses();
      }
    });
    this.$ga.page(this.$route.path);
    smoothscroll.polyfill(); // Safari does not support smoothscroll
    let dictionary = await this.$getDictionary();
    if (dictionary) {
      this.dictionaryCredit = await dictionary.credit();
    }
  },
  watch: {
    $route() {
      this.$ga.page(this.$route.path);
    },
  },
  methods: {
    share() {
      let meta = document.querySelector('[name="description"]');
      let description = meta ? meta.getAttribute("content") : "";
      if (navigator.share) {
        navigator.share({
          url: location.href,
          // title: document.title,
          // text: document.title + "\n" + description
        });
      }
    },
    reload() {
      location.reload();
    },
    updatei18n() {
      this.$i18n.locale = this.l1.code;
      this.$i18n.silentTranslationWarn = true;
      if (this.l1.translations) {
        this.$i18n.setLocaleMessage(this.l1.code, this.l1.translations);
      }
    },
    updateClasses() {
      this.classes = {
        "show-pinyin": this.l2Settings.showPinyin,
        "show-pinyin-for-saved":
          !this.l2Settings.showPinyin && this.l2 && this.l2.han,
        "show-simplified": !this.l2Settings.useTraditional,
        "show-traditional": this.l2Settings.useTraditional,
        "show-definition": this.l2Settings.showDefinition,
        "show-translation": this.l2Settings.showTranslation,
        "show-byeonggi": this.l2Settings.showByeonggi,
        "use-serif": this.l2Settings.useSerif,
      };
      this.classes[`l1-${this.l1.code}`] = true;
      this.classes[`l2-${this.l2.code}`] = true;
      if (this.l2.han) this.classes["l2-zh"] = true;
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
    isPWA() {
      return (
        (typeof navigator !== "undefined" && navigator.standalone) ||
        (typeof window !== "undefined" &&
          window.matchMedia("(display-mode: standalone)").matches)
      );
    },
    canShare() {
      return typeof navigator !== "undefined" && navigator.share;
    },
    ...mapState("settings", ["l2Settings", "l1", "l2"]),
  },
};
</script>

<style lang="scss">
.__nuxt-error-page {
  z-index: 99;
}

.zth-header {
  background-image: url(/img/background-branch.jpg);
  background-attachment: fixed;
  background-position: center;
  background-size: cover;
  padding-bottom: 102px;
  padding-top: 52px;
}

@media screen and (max-device-width: 1024px) {
  .zth-header {
    background-attachment: scroll;
  }
}

.site-top-bar {
  background-color: rgba(29, 29, 29, 0.5);
  position: absolute;
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  a {
    color: #ccc;
    line-height: 2.3rem;
  }
}

.btn-sign-in {
  font-size: 0.8rem;
  text-decoration: none;
}

.btn-sign-in img {
  height: 1.2rem;
  margin-bottom: 0.2rem;
}
</style>
