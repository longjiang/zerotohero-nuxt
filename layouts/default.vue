<template>
  <div id="zerotohero" :class="classes">
    <template v-if="$route.path !== '/'">
      <template>
        <div class="container-fluid p-2 pl-3 site-top-bar">
          <div>
            <router-link to="/" style="color: #ccc; line-height: 2.3rem">
              <i class="fa fa-chevron-left mr-2"></i>
              Zero to Hero Education
            </router-link>
          </div>
          <a
            v-if="l1.code === 'zh' && l2.code === 'en'"
            class="btn btn-sign-in text-white ml-1"
            style="background-color: #2c5aff"
            href="https://m.cctalk.com/inst/stevmab3"
            target="_blank"
          >
            登陆
            <img
              src="/img/logo-cctalk-white.png"
              class="logo-small ml-1"
              data-not-lazy
            />
          </a>
          <a
            v-if="l1.code === 'en' && l2.code === 'zh'"
            class="btn btn-primary btn-sign-in text-white ml-1"
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
        <div class="zth-header">
          <div class="container-fluid pl-0 pr-0">
            <div class="container">
              <div class="row">
                <div class="col-sm-12 text-center">
                  <router-link
                    v-if="l1.code === 'en' && l2.code === 'zh'"
                    to="/en/zh"
                  >
                    <img
                      src="/img/czh-logo-light.png"
                      alt="Chinese Zero to Hero"
                      style="max-width: 11rem; margin: 1.5rem 0"
                      data-not-lazy
                    />
                  </router-link>
                  <router-link
                    v-else-if="l1.code === 'zh' && l2.code === 'en'"
                    to="/zh/en"
                  >
                    <img
                      src="/img/ezh-logo-light.png"
                      alt="Chinese Zero to Hero"
                      style="max-width: 11rem; margin: 1.5rem 0"
                      data-not-lazy
                    />
                  </router-link>
                  <LanguageLogo
                    v-else-if="l1 && l2"
                    :l1="l1"
                    :l2="l2"
                    style="margin-top: 1.5rem"
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

        <footer class="container-fluid bg-dark text-light pt-4 pb-4">
          <div class="container">
            <div class="row mb-5">
              <div class="col-sm-12">
                <Choose :compact="true" />
              </div>
            </div>
          </div>
        </footer>
      </template>
    </template>
    <template v-else>
      <div>
        <div
          class="container-fluid pt-4"
          style="overflow: hidden; position: relative"
        >
          <img src="/img/background-stars.jpg" class="bg-stars" data-not-lazy />
          <div class="container">
            <div class="row pt-5">
              <div class="col-sm-6">
                <img src="/img/logo-z2h.png" class="z2h-logo" data-not-lazy />
              </div>
              <div class="col-sm-6">
                <img
                  src="/img/language-education-done-right.png"
                  class="z2h-slogan img-fluid d-none d-sm-block"
                  data-not-lazy
                />
              </div>
            </div>
            <div class="row pt-5">
              <div class="col-sm-6">
                <div class="home-card">
                  <router-link to="/en/zh">
                    <img
                      src="/img/czh-logo-dark.png"
                      class="czh-logo"
                      data-not-lazy
                    />
                  </router-link>
                  <hr />
                  <ul class="czh-links">
                    <li>
                      <router-link
                        to="/en/zh/online-courses"
                        style="color: #fd4f1c; font-weight: bold"
                      >
                        HSK courses
                      </router-link>
                    </li>
                    <li>
                      <router-link to="/en/zh/dictionary">
                        Dictionary
                      </router-link>
                    </li>
                    <li>
                      <router-link to="/en/zh/grammar">
                        Grammar reference
                      </router-link>
                    </li>
                    <li>
                      <router-link to="/en/zh/youtube/browse">
                        Audio-visual tools
                      </router-link>
                    </li>
                    <li>
                      <router-link to="/en/zh/reader">
                        Reading tools
                      </router-link>
                    </li>
                    <li>
                      <router-link to="/en/zh/resource/list/all/all">
                        Resources
                      </router-link>
                    </li>
                  </ul>
                  <hr />
                  <div
                    class="home-card-logos text-center"
                    style="line-height: 2rem"
                  >
                    <a
                      href="https://www.youtube.com/channel/UCQ3IlLg5VGeydxtswBoyt6A"
                    >
                      <img
                        src="/img/logo-youtube.png"
                        style="height: 1.2rem; padding: 0 0.5rem"
                      />
                    </a>
                    <a href="https://www.instagram.com/chinesezerotohero/">
                      <img
                        src="/img/logo-instagram.png"
                        style="height: 1.4rem; padding: 0 0.5rem"
                      />
                    </a>
                    <a href="http://chinesezerotohero.teachable.com/">
                      <img
                        src="/img/logo-teachable.png"
                        style="height: 1.4rem; padding: 0 0.5rem"
                      />
                    </a>
                    <a href="http://t.me/zerotohero_zh">
                      <img
                        src="/img/logo-telegram.png"
                        style="height: 1.4rem; padding: 0 0.5rem"
                      />
                    </a>
                  </div>
                </div>
              </div>
              <div class="col-sm-6">
                <div class="home-card">
                  <router-link to="/zh/en">
                    <img
                      src="/img/ezh-logo-dark.png"
                      class="ezh-logo"
                      data-not-lazy
                    />
                  </router-link>
                  <hr />
                  <ul class="czh-links">
                    <li>
                      <router-link
                        to="/zh/en/online-courses"
                        style="color: #1b3e76; font-weight: bold"
                      >
                        剑桥英语视频教程
                      </router-link>
                    </li>
                    <li>
                      <router-link
                        to="/zh/en/online-courses"
                        style="color: #1b3e76; font-weight: bold"
                      >
                        美式口语课程
                      </router-link>
                    </li>
                    <li>
                      <router-link to="/zh/en/dictionary">词典工具</router-link>
                    </li>
                    <li>
                      <router-link to="/zh/en/youtube/browse">
                        视听工具
                      </router-link>
                    </li>
                    <li>
                      <router-link to="/zh/en/reader">阅读工具</router-link>
                    </li>
                    <li>
                      <router-link to="/zh/en/resource/list/all/all">
                        其它资源
                      </router-link>
                    </li>
                  </ul>
                  <hr />
                  <div
                    class="home-card-logos text-center"
                    style="line-height: 2rem"
                  >
                    <a href="https://m.cctalk.com/inst/stevmab3">
                      <img src="/img/logo-cctalk.png" style="height: 1.2rem" />
                    </a>
                    &nbsp;&nbsp;
                    <a href="https://space.bilibili.com/253569339">
                      <img
                        src="/img/logo-bilibili.png"
                        style="height: 1.2rem"
                      />
                    </a>
                    &nbsp;&nbsp;
                    <a href="https://v.douyin.com/eNJCcD8/">
                      <img src="/img/logo-douyin.png" style="height: 1.4rem" />
                    </a>
                    &nbsp;&nbsp;
                    <a
                      href="https://www.xiaohongshu.com/user/profile/5fad77c0000000000100696e"
                    >
                      <img
                        src="/img/logo-xiaohongshu.png"
                        style="height: 1.4rem"
                      />
                    </a>
                    &nbsp;&nbsp;
                    <a href="/zh/en/contact-us">
                      <img src="/img/logo-wechat.png" style="height: 1.4rem" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="row mt-5 mb-4 text-dark">
          <div class="col-sm-12 text-center">
            <p style="font-size: 1.5rem">
              Resources for learning
              <strong><em>hundreds</em></strong>
              of languages
            </p>
            <p>
              学习
              <strong>数百种</strong>
              语言的资源
            </p>
          </div>
        </div>
      </div>
      <Choose :compact="true" />
      <SocialHead />
    </template>
  </div>
</template>

<script lang="javascript">
import Config from "@/lib/config";
import { mapState } from "vuex";

export default {
  data() {
    return {
      Config,
      focus: false,
      loaded: false,
      classes: {},
    };
  },
  async mounted() {
    if (this.l1 && this.l2) this.updateClasses();
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
        if (this.l1 && this.l2) this.updateClasses();
      }
    });
    this.$ga.page(this.$route.path);
  },
  watch: {
    $route() {
      this.$ga.page(this.$route.path);
    },
  },
  methods: {
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
      };
      this.classes[`l1-${this.l1.code}`] = true;
      this.classes[`l2-${this.l2.code}`] = true;
    },
    async loadSettings() {
      if (!this.$store.state.settings.settingsLoaded) {
        this.$store.commit("settings/LOAD_SETTINGS");
      }
      if (!this.$store.state.savedWords.savedWordsLoaded) {
        this.$store.commit("savedWords/LOAD_SAVED_WORDS");
      }
      if (!this.$store.state.savedCollocations.savedCollocationsLoaded) {
        this.$store.commit("savedCollocations/LOAD_SAVED_COLLOCATIONS");
      }
      if (!this.$store.state.savedHits.savedHitsLoaded) {
        this.$store.commit("savedHits/LOAD_SAVED_HITS");
      }
      if (!this.$store.state.tvShows.showsLoaded) {
        this.$store.dispatch("tvShows/load", {
          l2: this.l2,
          adminMode: this.$store.state.settings.adminMode,
        });
      }
    },
  },
  computed: {
    ...mapState("settings", ["l2Settings", "l1", "l2"]),
  },
};
</script>

<style>
.zth-header {
  background-image: url(/img/background-stars.jpg);
  background-size: cover;
  padding-bottom: 40px;
}

.home-card {
  border-radius: 1rem;
  background-color: white;
  box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.2);
  padding: 2rem;
  margin-bottom: 2rem;
}

.sale-card {
  border-radius: 1rem;
  background-image: url(/img/background-spring-sale.png);
  background-size: cover;
  padding: 3rem;
  text-align: center;
  color: #fcddc1;
}

.sale-card code {
  border-radius: 0.5rem;
  padding: 0.5rem;
  color: #004a5c;
  background-color: #fcddc1;
  font-weight: bold;
}

.bg-stars {
  z-index: -1;
  position: absolute;
  width: 100%;
  min-height: 30rem;
  left: 0;
  top: 0;
}

.site-top-bar {
  background-color: rgb(29, 29, 29);
  display: flex;
  justify-content: space-between;
}

.logo {
  height: 6rem;
}

.czh-links,
.ezh-links {
  column-count: 2;
  column-gap: 1rem;
  padding: 0;
  list-style: none;
}

.czh-links a,
.ezh-links a {
  color: #666;
  font-size: 0.8em;
}

.z2h-logo {
  height: 10rem;
  display: block;
}

.z2h-slogan {
  max-height: 10rem;
  position: absolute;
  right: 1rem;
}

.czh-logo,
.ezh-logo {
  max-width: 70%;
  margin: 0 auto;
  display: block;
}

.zerotohero {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
}

.zerotohero-item {
  width: 15rem;
}

.btn-sign-in {
  font-size: 0.8rem;
  text-decoration: none;
}

.btn-sign-in img {
  height: 1.2rem;
  margin-bottom: 0.2rem;
}

.small-star {
  border: none;
  background: none;
  padding: 0;
  display: inline-block;
  color: #666;
  font-size: 0.7rem;
  margin: 0;
}

@font-face {
  font-family: "Klingon pIqaD HaSta";
  src: url("/fonts/Klingon-pIqaD-HaSta.ttf") format("truetype");
}

.klingon {
  font-family: Constructium, Unifont CSUR, Klingon pIqaD HaSta, Code2000, Horta;
  font-size: 2rem;
}

html * {
  font-family: Helvetica, sans-serif;
}

body {
  color: #666;
}

.main {
  min-height: calc(100vh - 30rem);
}

h1,
h2,
h3,
h4,
h5,
h6,
.h1,
.h2,
.h3,
.h4,
.h5,
.h6 {
  font-weight: bold;
}

.results-1,
.results-2 {
  padding: 1rem 0;
}

.shadowed {
  -webkit-filter: drop-shadow(5px 5px 5px rgba(0, 0, 0, 0.3));
  filter: drop-shadow(5px 5px 5px rgba(0, 0, 0, 0.3));
}

.link-unstyled,
.link-unstyled:hover {
  color: inherit;
  text-decoration: none;
}

.cards {
  display: flex;
  flex-wrap: wrap;
}

.card {
  padding: 1.5rem;
  margin: 1rem;
  flex: 1;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  min-width: 20rem;
}

.book-thumb {
  height: 10rem;
}

.aspect-wrapper {
  padding-bottom: 56.25%;
  position: relative;
}

.aspect {
  width: 100%;
  height: 100%;
  position: absolute;
  object-fit: cover;
}

.media {
  width: 100%;
  display: block;
  overflow: hidden;
}

.media-body {
  padding: 1.5rem;
}

.noun {
  color: #5c9258;
}

.adjective {
  color: #885b9a;
}

.verb {
  color: #ad8e57;
}

.top-bar {
  background-color: #3a3a3a;
  color: white;
}

.top-bar a {
  color: #fd5112;
  font-weight: bold;
  text-decoration: underline;
}

.declined-word {
  box-shadow: 0.3rem 0.3rem 1rem #0000003b;
  margin: 1.6rem 0;
  border-radius: 0.5rem;
  position: relative;
}

.declined-word-inner {
  display: flex;
  padding: 2rem;
  align-items: center;
}

.hint {
  width: 100%;
  padding: 0.5rem 1rem;
  background: #f1f1f1;
  color: #9a9a9a;
  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
}

.example-image-wrapper {
  flex: 1;
  text-align: center;
  margin-right: 2rem;
}

.example-wrapper {
  flex: 3;
}

.example-translation {
  color: #999;
}

.blank {
  background: #596394;
  padding: 0.1rem 0.4rem;
  color: white;
  border-radius: 0.2rem;
  font-weight: normal;
  position: relative;
  cursor: pointer;
  display: inline-block;
}

.blank.answered {
  background: #5a9459;
}

.transparent {
  visibility: hidden;
}

.answer {
  position: absolute;
  left: 0.4rem;
  width: 100%;
  text-align: left;
  display: inline-block;
}

.hidden {
  display: none;
}

.mt1 {
  margin-top: 1rem;
}

.mt2 {
  margin-top: 2rem;
}

[data-case] {
  background-color: #e4e4e4;
  position: relative;
}

[data-case*="nominative"] {
  background-color: #fff0c2;
}

[data-case*="genitive"] {
  background-color: #e6ffc2;
}

[data-case*="dative"] {
  background-color: #c2f3ff;
}

[data-case*="accusative"] {
  background-color: #ffd6d6;
}

[data-case*="instrumental"] {
  background-color: #d0f7f3;
}

[data-case*="prepositional"] {
  background-color: #dbe4fb;
}

[data-case*="locative"] {
  background-color: #fac2ff;
}

.popup {
  padding: 1rem;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
  position: fixed;
  background: white;
  top: 1.2rem;
  left: 0;
  z-index: 1;
}

#legend div {
  display: inline-block;
  padding: 0 0.5rem;
}

#analyzed {
  overflow: visible;
}

.word-block-dictionary {
  display: none;
}

.show-level-1 .word-block-dictionary[data-level="Pre-A1"]:not(.seen),
.show-level-2 .word-block-dictionary[data-level="A1"]:not(.seen),
.show-level-3 .word-block-dictionary[data-level="A2"]:not(.seen),
.show-level-4 .word-block-dictionary[data-level="B1"]:not(.seen),
.show-level-5 .word-block-dictionary[data-level="B2"]:not(.seen),
.show-level-6 .word-block-dictionary[data-level="C1"]:not(.seen),
.show-level-outside
  .word-block-dictionary[data-level="C2"]:not(.seen):not(.common) {
  display: inline;
  color: #838888 !important;
}

.levelPreA1,
[data-level="Pre-A1"],
[data-hover-level="Pre-A1"]:hover,
[data-hover-level="Pre-A1"].saved {
  color: #b51700 !important;
}

.levelA1,
[data-level="A1"],
[data-hover-level="A1"]:hover,
[data-hover-level="A1"].saved {
  color: #0076ba !important;
}

.levelA2,
[data-level="A2"],
[data-hover-level="A2"]:hover,
[data-hover-level="A2"].saved {
  color: #00882b !important;
}

.levelB1,
[data-level="B1"],
[data-hover-level="B1"]:hover,
[data-hover-level="B1"].saved {
  color: #6a348a !important;
}

.levelB2,
[data-level="B2"],
[data-hover-level="B2"]:hover,
[data-hover-level="B2"].saved {
  color: #5b0516 !important;
}

.levelC1,
[data-level="C1"],
[data-hover-level="C1"]:hover,
[data-hover-level="C1"].saved {
  color: #011b3c !important;
}

.levelC2,
[data-level="C2"],
[data-hover-level="C2"]:hover,
[data-hover-level="C2"].saved {
  color: #005f58 !important;
}

.leveloutside,
[data-level="outside"],
[data-hover-level="outside"]:hover,
[data-hover-level="outside"].saved {
  color: #c59f94 !important;
}

.bg-levelPreA1,
[data-bg-level="Pre-A1"] {
  background-color: #b51700 !important;
  color: white !important;
}

.bg-levelA1,
[data-bg-level="A1"] {
  background-color: #0076ba !important;
  color: white !important;
}

.bg-levelA2,
[data-bg-level="A2"] {
  background-color: #00882b !important;
  color: white !important;
}

.bg-levelB1,
[data-bg-level="B1"] {
  background-color: #6a348a !important;
  color: white !important;
}

.bg-levelB2,
[data-bg-level="B2"] {
  background-color: #5b0516 !important;
  color: white !important;
}

.bg-levelC1,
[data-bg-level="C1"] {
  background-color: #011b3c !important;
  color: white !important;
}

.bg-levelC2,
[data-bg-level="C2"] {
  background-color: #005f58 !important;
  color: white !important;
}

.bg-leveloutside,
[data-bg-level="outside"] {
  background-color: #c59f94 !important;
  color: white !important;
}

.l2-zh .word-block-dictionary {
  display: none;
}

.l2-zh .show-level-1 .word-block-dictionary[data-level="1"]:not(.seen),
.l2-zh .show-level-2 .word-block-dictionary[data-level="2"]:not(.seen),
.l2-zh .show-level-3 .word-block-dictionary[data-level="3"]:not(.seen),
.l2-zh .show-level-4 .word-block-dictionary[data-level="4"]:not(.seen),
.l2-zh .show-level-5 .word-block-dictionary[data-level="5"]:not(.seen),
.l2-zh .show-level-6 .word-block-dictionary[data-level="6"]:not(.seen),
.l2-zh
  .show-level-outside
  .word-block-dictionary[data-level="outside"]:not(.seen):not(.common) {
  display: inline;
  color: inherit !important;
}

.l2-zh .level1,
.l2-zh [data-level="1"],
.l2-zh [data-hover-level="1"]:hover,
.l2-zh [data-hover-level="1"].saved,
.l2-zh .show-level-1 [data-hover-level="1"].sticky:not(.seen) {
  color: #f8b51e !important;
}

.l2-zh .level2,
.l2-zh [data-level="2"],
.l2-zh [data-hover-level="2"]:hover,
.l2-zh [data-hover-level="2"].saved,
.l2-zh .show-level-2 [data-hover-level="2"].sticky:not(.seen) {
  color: #267f94 !important;
}

.l2-zh .level3,
.l2-zh [data-level="3"],
.l2-zh [data-hover-level="3"]:hover,
.l2-zh [data-hover-level="3"].saved,
.l2-zh .show-level-3 [data-hover-level="3"].sticky:not(.seen) {
  color: #fd4f1c !important;
}

.l2-zh .level4,
.l2-zh [data-level="4"],
.l2-zh [data-hover-level="4"]:hover,
.l2-zh [data-hover-level="4"].saved,
.l2-zh .show-level-4 [data-hover-level="4"].sticky:not(.seen) {
  color: #bb1718 !important;
}

.l2-zh .level5,
.l2-zh [data-level="5"],
.l2-zh [data-hover-level="5"]:hover,
.l2-zh [data-hover-level="5"].saved,
.l2-zh .show-level-5 [data-hover-level="5"].sticky:not(.seen) {
  color: #1b3e76 !important;
}

.l2-zh .level6,
.l2-zh [data-level="6"],
.l2-zh [data-hover-level="6"]:hover,
.l2-zh [data-hover-level="6"].saved,
.l2-zh .show-level-6 [data-hover-level="6"].sticky:not(.seen) {
  color: #6a3669 !important;
}

.l2-zh .level7-9,
.l2-zh [data-level="7-9"],
.l2-zh [data-hover-level="7-9"]:hover,
.l2-zh [data-hover-level="7-9"].saved,
.l2-zh .show-level-7-9 [data-hover-level="7-9"].sticky:not(.seen) {
  color: #005f58 !important;
}

.l2-zh .leveloutside,
.l2-zh [data-level="outside"],
.l2-zh [data-hover-level="outside"]:hover,
.l2-zh [data-hover-level="outside"].saved,
.l2-zh
  .show-level-7
  [data-hover-level="outside"].sticky:not(.seen):not(.common) {
  color: #c59f94 !important;
}

.l2-zh .bg-level1,
.l2-zh [data-bg-level="1"] {
  background-color: #f8b51e !important;
  color: white !important;
}

.l2-zh .bg-level2,
.l2-zh [data-bg-level="2"] {
  background-color: #267f94 !important;
  color: white !important;
}

.l2-zh .bg-level3,
.l2-zh [data-bg-level="3"] {
  background-color: #fd4f1c !important;
  color: white !important;
}

.l2-zh .bg-level4,
.l2-zh [data-bg-level="4"] {
  background-color: #bb1718 !important;
  color: white !important;
}

.l2-zh .bg-level5,
.l2-zh [data-bg-level="5"] {
  background-color: #1b3e76 !important;
  color: white !important;
}

.l2-zh .bg-level6,
.l2-zh [data-bg-level="6"] {
  background-color: #6a3669 !important;
  color: white !important;
}

.l2-zh .bg-level7-9,
.l2-zh [data-bg-level="7-9"] {
  background-color: #005f58 !important;
  color: white !important;
}

.l2-zh .bg-leveloutside,
.l2-zh [data-bg-level="outside"] {
  background-color: #c59f94 !important;
  color: white !important;
}

.widget-title {
  display: block;
  text-align: center;
  font-weight: bold;
  color: white;
  background: #4e4e4e;
  padding: 0.2rem 1rem;
  border-radius: 0.3rem 0.3rem 0 0;
}

.widget-body {
  /* background: #f2f2f2; */
  border-radius: 0 0 0.3rem 0.3rem;
}

.widget {
  box-shadow: 0px 5px 20px rgb(0 0 0 / 10%);
  border-radius: 0.3rem;
  overflow: hidden;
  background: #f6f6f6;
}

.logo-small {
  max-width: 6rem;
  max-height: 3rem;
}

.highlight {
  font-weight: bold;
}

.btn-medium {
  display: inline-block;
  border: none;
  padding: 0.2rem 0.5rem;
  border-radius: 0.3rem;
}

ul.collapsed li:nth-child(n + 5) {
  display: none;
}

ul.collapse-4.collapsed li:nth-child(-n + 4) {
  display: inherit;
}

ul.collapse-5.collapsed li:nth-child(-n + 5) {
  display: inherit;
}

ul.collapse-6.collapsed li:nth-child(-n + 6) {
  display: inherit;
}

ul.collapse-7.collapsed li:nth-child(-n + 7) {
  display: inherit;
}

ul.collapse-8.collapsed li:nth-child(-n + 8) {
  display: inherit;
}

ul.collapse-9.collapsed li:nth-child(-n + 9) {
  display: inherit;
}

ul.collapse-10.collapsed li:nth-child(-n + 10) {
  display: inherit !important;
}

.booklist {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
}

.booklist-item {
  flex: 1;
  min-width: 10rem;
  margin: 1rem;
  border-radius: 0.3rem;
}

.booklist-item-thumb {
  width: 5rem;
  height: calc(5rem * 1.33);
  display: inline-block;
}

.big-word {
  font-size: 3rem;
  font-weight: bold;
}

#zerotohero:not(.show-simplified) .simplified,
#zerotohero:not(.show-traditional) .traditional {
  display: none;
}

.btn-small {
  color: #a7a7a7;
  font-size: 0.8rem;
  padding: 0.1rem 0.4rem;
  border-radius: 0.2rem;
  background-color: #f3f3f3;
  position: relative;
  display: inline-block;
  border: none;
}

.btn-small:hover {
  background-color: #b5b5b5;
  text-decoration: none;
  color: #868686;
}

.btn-small img {
  height: 0.9rem;
  margin-bottom: 0.2rem;
  filter: opacity(0.3);
}

.btn-primary {
  background-color: #fd4f1c;
  border-color: #fd4f1c;
  color: white;
}

.btn-primary:hover,
.btn-primary:focus,
.btn-primary:not(:disabled):not(.disabled):active {
  background-color: #ce3d11;
  border-color: #ce3d11;
  color: white;
}

.btn-gray {
  background: #efefef;
  color: #8e8e8e;
}

.btn-gray:hover {
  color: white;
  text-decoration: none;
  background: #989898;
}

.article {
  list-style: none;
  margin-bottom: 1rem;
  box-shadow: 5px 5px 20px rgba(0, 0, 0, 0.2);
  border-radius: 0.3rem;
  overflow: hidden;
}

.article-title {
  border-bottom: 1px solid #ececec;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
  color: #fd4f1c;
}

.article-list-item .article-body {
  font-size: 1rem;
}

.article-list-item.collapsed .article-body {
  max-height: 10rem;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(180deg, #000 60%, transparent);
  mask-image: linear-gradient(180deg, #000 60%, transparent);
}

.article-list-item a {
  color: inherit;
}

.article-list-item a:hover {
  color: inherit;
  text-decoration: none;
}

.article-body img {
  display: none;
}

.btn-default {
  background: #cecece;
  color: white;
}

.btn-default:hover {
  background: #fd4f1c;
  color: white;
}

.list-group-item.active {
  background-color: #fd4f1c;
  border-color: #fd4f1c;
}

.list-group-item.active:hover {
  color: white;
}

.foreground {
  z-index: 2;
  position: relative;
}

.img-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.coupon-code {
  background-color: white;
  font-size: 1.2em;
  color: #fd4f1c;
  padding: 0.2rem 0.5rem;
  border-radius: 0.2rem;
}

.study-sheet-table {
  position: relative;
}
.study-sheet-td-translation,
.study-sheet-td-text {
  min-width: 20vw;
}

.show-pinyin .study-sheet-table .word-block .word-block-pinyin,
.show-simplified .study-sheet-table .word-block .word-block-simplified,
.show-traditional .study-sheet-table .word-block .word-block-traditional,
.show-definition .study-sheet-table .word-block .word-block-definition {
  display: inline;
}

.add-pinyin .study-sheet-table .word-block .word-block-text {
  display: inline;
}

.study-sheet-td-translation {
  padding: 4px;
  vertical-align: top;
  padding-right: 21px;
  color: #8fa9c1;
  line-height: 14px;
}

.study-sheet-table .study-sheet-td-text {
  padding: 8px;
  vertical-align: top;
  padding-right: 21px;
  line-height: 1.5;
}

.study-sheet-table .study-sheet-td-text span {
  color: black !important;
}

.study-sheet-td-definition {
  padding: 4px;
  vertical-align: top;
  line-height: 14px;
}

.study-sheet-table .study-sheet-td-definition span {
  color: #757171 !important;
}

.study-sheet-td-translation span {
  font-size: 8px;
  font-family: "Adobe Text Pro", serif;
}

.study-sheet-td-text span {
  font-size: 11px;
  font-family: "Adobe Text Pro", serif;
}

.l2-zh .study-sheet-td-text span {
  font-family: "Source Han Serif SC", serif;
}

.study-sheet-td-definition span {
  font-size: 8px;
}

.l1-zh .study-sheet-td-definition span {
  font-family: "Source Han Serif SC", serif;
}

.l2-zh .study-sheet-td-definition span {
  font-family: "Adobe Text Pro", serif;
}

.study-sheet-td-definition span .word-block-dictionary-simplified {
  font-family: "Adobe Text Pro", serif;
}

.l2-zh .study-sheet-td-definition span .word-block-dictionary-simplified {
  font-family: "Source Han Serif SC", serif;
}

.study-sheet-td-definition span .word-block-dictionary-phonetic {
  font-family: "gentium plus";
}

/* for the text column */
.show-level-1 .study-sheet-table [data-hover-level="1"].sticky:not(.seen) span,
.show-level-2 .study-sheet-table [data-hover-level="2"].sticky:not(.seen) span,
.show-level-3 .study-sheet-table [data-hover-level="3"].sticky:not(.seen) span,
.show-level-4 .study-sheet-table [data-hover-level="4"].sticky:not(.seen) span,
.show-level-5 .study-sheet-table [data-hover-level="5"].sticky:not(.seen) span,
.show-level-6 .study-sheet-table [data-hover-level="6"].sticky:not(.seen) span,
.show-level-outside
  .study-sheet-table
  [data-hover-level="outside"].sticky:not(.seen):not(.common)
  span {
  color: #b74900 !important;
}

/* for the definition column */
.show-level-1 .study-sheet-table [data-level="1"]:not(.seen),
.show-level-2 .study-sheet-table [data-level="2"]:not(.seen),
.show-level-3 .study-sheet-table [data-level="3"]:not(.seen),
.show-level-4 .study-sheet-table [data-level="4"]:not(.seen),
.show-level-5 .study-sheet-table [data-level="5"]:not(.seen),
.show-level-6 .study-sheet-table [data-level="6"]:not(.seen),
.show-level-outside
  .study-sheet-table
  [data-level="outside"]:not(.seen):not(.common) {
  color: #b74900 !important;
}

/* for the text column */
.show-level-1 .study-sheet-table [data-hover-level="Pre-A1"].sticky:not(.seen),
.show-level-2 .study-sheet-table [data-hover-level="A1"].sticky:not(.seen),
.show-level-3 .study-sheet-table [data-hover-level="A2"].sticky:not(.seen),
.show-level-4 .study-sheet-table [data-hover-level="B1"].sticky:not(.seen),
.show-level-5 .study-sheet-table [data-hover-level="B2"].sticky:not(.seen),
.show-level-6 .study-sheet-table [data-hover-level="C1"].sticky:not(.seen),
.show-level-outside
  .study-sheet-table
  [data-hover-level="C2"].sticky:not(.seen):not(.common) {
  color: #b74900 !important;
}

/* for the definition column */
.show-level-1 .study-sheet-table [data-level="Pre-A1"]:not(.seen),
.show-level-2 .study-sheet-table [data-level="A1"]:not(.seen),
.show-level-3 .study-sheet-table [data-level="A2"]:not(.seen),
.show-level-4 .study-sheet-table [data-level="B1"]:not(.seen),
.show-level-5 .study-sheet-table [data-level="B2"]:not(.seen),
.show-level-6 .study-sheet-table [data-level="C1"]:not(.seen),
.show-level-outside
  .study-sheet-table
  [data-level="C2"]:not(.seen):not(.common):not(.low-rank) {
  color: #b74900 !important;
}

.word-square {
  padding: 4px;
  font-size: 10px;
  width: 30px;
  height: 30px;
  overflow: hidden;
  line-height: 10px;
  text-align: center;
  display: flex;
  float: left;
  justify-content: center;
  align-items: center;
  border: 1px solid white;
  font-weight: bold;
}
</style>
