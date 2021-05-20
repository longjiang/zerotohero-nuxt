<template>
  <div id="zerotohero" :class="classes">
    <template v-if="this.$route.path !== '/'">
      <template v-if="langsLoaded">
        <div class="container-fluid p-2 pl-3 site-top-bar">
          <div>
            <a href="/" style="color: #ccc; line-height: 2.3rem">
              <i class="fa fa-chevron-left mr-2"></i>
              Zero to Hero Education
            </a>
          </div>
          <a
            v-if="$l1.code === 'zh' && $l2.code === 'en'"
            class="btn btn-sign-in text-white ml-1"
            style="background-color: #2c5aff"
            href="https://m.cctalk.com/inst/stevmab3"
            target="_blank"
          >
            登陆
            <img src="/img/logo-cctalk-white.png" class="logo-small ml-1" />
          </a>
          <a
            v-if="$l1.code === 'en' && $l2.code === 'zh'"
            class="btn btn-primary btn-sign-in text-white ml-1"
            href="https://sso.teachable.com/secure/133035/users/sign_in"
            target="_blank"
          >
            Login to
            <img src="/img/teachable_light.png" class="logosp-small" />
          </a>
        </div>
        <div class="zth-header">
          <div class="container-fluid pl-0 pr-0">
            <div class="container">
              <div class="row">
                <div class="col-sm-12 text-center">
                  <a
                    v-if="this.$l1.code === 'en' && this.$l2.code === 'zh'"
                    href="/en/zh"
                  >
                    <img
                      src="/img/czh-logo-light.png"
                      alt="Chinese Zero to Hero"
                      style="max-width: 11rem; margin: 1.5rem 0"
                    />
                  </a>
                  <a
                    v-else-if="this.$l1.code === 'zh' && this.$l2.code === 'en'"
                    href="/zh/en"
                  >
                    <img
                      src="/img/ezh-logo-light.png"
                      alt="Chinese Zero to Hero"
                      style="max-width: 11rem; margin: 1.5rem 0"
                    />
                  </a>
                  <LanguageLogo
                    v-else
                    :l1="$l1"
                    :l2="$l2"
                    style="margin-top: 1.5rem"
                  />
                </div>
              </div>
            </div>
          </div>
          <Nav />
        </div>

        <keep-alive>
          <router-view ref="routerView" id="main" />
        </keep-alive>

        <ReaderComp :iconMode="true" />

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
      <div class="container-fluid pt-4">
        <img src="/img/background-stars.jpg" class="bg-stars" />
        <div class="container">
          <div class="row pt-5">
            <div class="col-sm-6">
              <img src="/img/logo-z2h.png" class="z2h-logo" />
            </div>
            <div class="col-sm-6">
              <img
                src="/img/language-education-done-right.png"
                class="z2h-slogan img-fluid d-none d-sm-block"
              />
            </div>
          </div>
          <div class="row pt-5">
            <div class="col-sm-6">
              <div class="home-card">
                <a href="/en/zh">
                  <img src="/img/czh-logo-dark.png" class="czh-logo" />
                </a>
                <hr />
                <ul class="czh-links">
                  <li>
                    <a
                      href="/en/zh/online-courses"
                      style="color: #fd4f1c; font-weight: bold"
                    >
                      HSK courses
                    </a>
                  </li>
                  <li><a href="/en/zh/dictionary">Dictionary</a></li>
                  <li><a href="/en/zh/grammar">Grammar reference</a></li>
                  <li>
                    <a href="/en/zh/youtube/browse">Audio-visual tools</a>
                  </li>
                  <li><a href="/en/zh/reader">Reading tools</a></li>
                  <li><a href="/en/zh/resource/list/all/all">Resources</a></li>
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
                <a href="/zh/en">
                  <img src="/img/ezh-logo-dark.png" class="ezh-logo" />
                </a>
                <hr />
                <ul class="czh-links">
                  <li>
                    <a
                      href="/zh/en/online-courses"
                      style="color: #1b3e76; font-weight: bold"
                    >
                      剑桥英语视频教程
                    </a>
                  </li>
                  <li>
                    <a
                      href="/zh/en/online-courses"
                      style="color: #1b3e76; font-weight: bold"
                    >
                      美式口语课程
                    </a>
                  </li>
                  <li><a href="/zh/en/dictionary">词典工具</a></li>
                  <li><a href="/zh/en/youtube/browse">视听工具</a></li>
                  <li><a href="/zh/en/reader">阅读工具</a></li>
                  <li><a href="/zh/en/resource/list/all/all">其它资源</a></li>
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
                    <img src="/img/logo-bilibili.png" style="height: 1.2rem" />
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
      </div>
      <Choose :compact="true" />
    </template>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Config from '@/lib/config'

export default Vue.extend({
  data() {
    return {
      Config,
      updateSettings: 0,
      classes: undefined,
      languages: [],
      langsLoaded: false,
      focus: false,
      loaded: false,
    };
  },
  methods: {
    loadSettings() {
      Vue.prototype.$settings = Object.assign(
        {
          showDefinition: false,
          showTranslation: true,
          showPinyin: true,
          useTraditional: false,
          showQuiz: true,
          adminMode: false,
        },
        JSON.parse(localStorage.getItem("zthSettings"))
      );
    },
    async loadLanguages() {
      Vue.prototype.$hasFeature = (feature) => {
        return this.$languages
          .getFeatures({
            l1: this.$l1,
            l2: this.$l2,
          })
          .includes(feature);
      };
      let dictionaries = this.$l1.dictionaries // ['freedict']
        ? this.$l1.dictionaries[this.$l2["iso639-3"]]
        : undefined;
      if (!Vue.prototype.$dictionary && dictionaries) {
        Vue.prototype.$dictionaryName = dictionaries[0]; // 'freedict'
        Vue.prototype.$dictionary = Dict.load({
          dict: Vue.prototype.$dictionaryName,
          l1: this.$l1["iso639-3"],
          l2: this.$l2["iso639-3"],
        });
      }
      if (!Vue.prototype.$hanzi && ["zh", "ko", "ja"].includes(this.$l2.code)) {
        Vue.prototype.$hanzi = (await import(`@/lib/hanzi.js`)).default.load();
        Vue.prototype.$unihan = (
          await import(`@/lib/unihan.js`)
        ).default.load();
      }
      if (!Vue.prototype.$grammar && ["zh"].includes(this.$l2.code)) {
        Vue.prototype.$grammar = (
          await import(`@/lib/grammar.js`)
        ).default.load();
      }
      this.langsLoaded = true;
    },
    updateClasses() {
      this.classes = {
        "hide-except-focus": this.focus,
        "show-pinyin": this.$settings.showPinyin,
        "show-pinyin-for-saved": !this.$settings.showPinyin && this.$l2.han,
        "show-simplified": !this.$settings.useTraditional,
        "show-traditional": this.$settings.useTraditional,
        "show-definition": this.$settings.showDefinition,
        "show-translation": this.$settings.showTranslation,
      };
      if (this.$l1) this.classes[`l1-${this.$l1.code}`] = true;
      if (this.$l2) this.classes[`l2-${this.$l2.code}`] = true;
    },
    updateFavicon() {
      var link =
        document.querySelector("link[rel*='icon']") ||
        document.createElement("link");
      link.type = "image/x-icon";
      link.rel = "shortcut icon";
      link.href = this.$languages.logo(this.$l2.code);
      document.getElementsByTagName("head")[0].appendChild(link);
    },
    updateTitle() {
      document.title = document.title
        .replace("| Zero to Hero", `| ${this.$l2.name} Zero to Hero`)
        .replace(/^Zero to Hero/, `${this.$l2.name} Zero to Hero`);
    },
    async setL1() {
      Vue.prototype.$l1 = this.$languages.getSmart(this.$route.params.l1);
      this.$i18n.locale = this.$l1.code;
      this.$i18n.silentTranslationWarn = true;
      try {
        this.$i18n.setLocaleMessage(
          this.$l1.code,
          (await import(`@/lib/langs/${this.$l1["iso639-3"]}.js`)).default
            .translations
        );
      } catch (err) {
        console.log(
          `UI translations for ${this.$l1["iso639-3"]} is unavailable.`
        );
      }
    },
    async setL2() {
      Vue.prototype.$l2 = this.$languages.getSmart(this.$route.params.l2);
      try {
        this.$i18n.setLocaleMessage(
          this.$l2.code,
          (await import(`@/lib/langs/${this.$l2["iso639-3"]}.js`)).default
            .translations
        );
      } catch (err) {
        console.log(
          `UI translations for ${this.$l2["iso639-3"]} is unavailable.`
        );
      }
    },
  },
  watch: {
    updateSettings() {
      this.updateClasses();
    },
    async $route() {
      console.log('routing...')
      this.$ga.page(this.$route.path);
      if (this.$route.params.l1 && this.$route.params.l2) {
        if (
          (this.$l1 && this.$route.params.l1 !== this.$l1.code) ||
          (this.$l2 && this.$route.params.l2 !== this.$l2.code)
        ) {
          // switching language
          location.reload();
        } else {
          // first time loading, set the language
          await this.setL1();
          await this.setL2();
          this.loadLanguages();
          this.updateFavicon();
          this.updateTitle();
          this.loadSettings();
          this.updateClasses();
        }
      }
    },
  },
});
</script>

<style>
.zth-header {
  background-image: url(/img/background-stars.jpg);
  background-size: cover;
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
</style>
