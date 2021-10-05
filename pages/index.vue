<router>
  {
    name: 'index',
    path: '/',
    meta: {
      layout: 'full'
    }
  }
</router>
<template>
  <div>
    <SocialHead
      title="Zero to Hero Languages | Master any language by comprehensible input."
      description="We provide live TV channels in the target language, TV shows with subtitles, music with lyrics, phrasebooks with video examples... everything that can help you to learn a language “by osmosis.” We are also known for our “Chinese Zero to Hero” and “English Zero to Hero” online language courses."
    />
    <div
      class="container-fluid pt-4"
      style="overflow: hidden; position: relative"
    >
      <div class="container">
        <div class="row pt-5 mb-5">
          <div class="col-sm-12">
            <div class="z2h-logo" style="line-height: 1.2">
              <strong style="font-size: 3rem">zerotohero.ca</strong>
              <div class="mt-3" style="font-weight: 300; font-size: 1.6rem">
                Learn all languages of the world. Fully open-source.
              </div>
            </div>
          </div>
        </div>
        <!-- <Sale class="mb-5" style="border-radius: 1rem !important" /> -->
        <client-only>
          <div :class="{ 'row mb-5': true, 'd-none': !hasDashboard }">
            <div class="col-sm-12">
              <div class="home-card mb-0" style="padding: 1rem">
                <LazyDashboard
                  @hasDashboard="hasDashboardUpdate"
                  style="padding-top: 0.5rem"
                />
              </div>
            </div>
          </div>
        </client-only>
        <div class="row" v-if="!hasDashboard">
          <div class="col-sm-12">
            <div class="intro-text mb-5 text-center">
              <p class="mb-0" style="font-size: 1.1em">
                This is heaven for language lovers. You can find dictionary
                tools, tens of thousands of videos with subtitles and other
                resources across
                <router-link
                  :to="{ name: 'language-map' }"
                  class="link-unstyled"
                  style="text-decoration: underline"
                >
                  hundreds of languages
                </router-link>
                ! Fully open-source – see
                <a
                  href="https://github.com/longjiang/zerotohero-nuxt"
                  class="link-unstyled"
                  style="text-decoration: underline"
                  target="_blank"
                >
                  our repository on GitHub
                </a>
                , and follow us on
                <a
                  href="https://twitter.com/zerotoherolang"
                  target="_blank"
                  class="link-unstyled"
                  style="text-decoration: underline"
                >
                  Twitter.
                </a>
              </p>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-sm-6 mb-5">
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
                    HSK Courses
                  </router-link>
                </li>
                <li>
                  <router-link to="/en/zh/dictionary">
                    Chinese Dictionary
                  </router-link>
                </li>
                <li>
                  <router-link to="/en/zh/phrasebooks">
                    Chinese Phrasebooks
                  </router-link>
                </li>
                <li>
                  <router-link to="/en/zh/grammar">Chinese Grammar</router-link>
                </li>
                <li>
                  <router-link to="/en/zh/live-tv">Live Chinese TV</router-link>
                </li>
                <li>
                  <router-link to="/en/zh/tv-shows">
                    Chinese TV Shows
                  </router-link>
                </li>
                <li>
                  <router-link to="/en/zh/reader">Reading Tools</router-link>
                </li>
                <li>
                  <router-link to="/en/zh/resource/list/all/all">
                    Chinese Resources
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
                    data-not-lazy
                  />
                </a>
                <a href="https://www.instagram.com/chinesezerotohero/">
                  <img
                    src="/img/logo-instagram.png"
                    style="height: 1.4rem; padding: 0 0.5rem"
                    data-not-lazy
                  />
                </a>
                <a href="http://chinesezerotohero.teachable.com/">
                  <img
                    src="/img/logo-teachable.png"
                    style="height: 1.4rem; padding: 0 0.5rem"
                    data-not-lazy
                  />
                </a>
                <a href="http://t.me/zerotohero_zh">
                  <img
                    src="/img/logo-telegram.png"
                    style="height: 1.4rem; padding: 0 0.5rem"
                    data-not-lazy
                  />
                </a>
              </div>
            </div>
          </div>
          <div class="col-sm-6 mb-5">
            <div class="home-card">
              <router-link to="/zh/en">
                <img
                  src="/img/ezh-logo-dark.png"
                  class="ezh-logo"
                  data-not-lazy
                />
              </router-link>
              <hr />
              <ul class="ezh-links">
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
                  <router-link to="/zh/en/dictionary">英语词典工具</router-link>
                </li>
                <li>
                  <router-link to="/zh/en/phrasebooks">英语短语集</router-link>
                </li>
                <li>
                  <router-link to="/zh/en/live-tv">英语电视直播</router-link>
                </li>
                <li>
                  <router-link to="/zh/en/tv-shows">英语电视节目</router-link>
                </li>
                <li>
                  <router-link to="/zh/en/reader">英语阅读工具</router-link>
                </li>
                <li>
                  <router-link to="/zh/en/resource/list/all/all">
                    其它英语资源
                  </router-link>
                </li>
              </ul>
              <hr />
              <div
                class="home-card-logos text-center"
                style="line-height: 2rem"
              >
                <a href="https://m.cctalk.com/inst/stevmab3">
                  <img
                    src="/img/logo-cctalk.png"
                    style="height: 1.2rem"
                    data-not-lazy
                  />
                </a>
                &nbsp;&nbsp;
                <a href="https://space.bilibili.com/253569339">
                  <img
                    src="/img/logo-bilibili.png"
                    style="height: 1.2rem"
                    data-not-lazy
                  />
                </a>
                &nbsp;&nbsp;
                <a href="https://v.douyin.com/eNJCcD8/">
                  <img
                    src="/img/logo-douyin.png"
                    style="height: 1.4rem"
                    data-not-lazy
                  />
                </a>
                &nbsp;&nbsp;
                <a
                  href="https://www.xiaohongshu.com/user/profile/5fad77c0000000000100696e"
                >
                  <img
                    src="/img/logo-xiaohongshu.png"
                    style="height: 1.4rem"
                    data-not-lazy
                  />
                </a>
                &nbsp;&nbsp;
                <a href="/zh/en/contact-us">
                  <img
                    src="/img/logo-wechat.png"
                    style="height: 1.4rem"
                    data-not-lazy
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-sm-6 mb-5">
            <div class="home-card text-center">
              <h5 class="mb-3">Map of Languages</h5>
              <router-link to="/language-map">
                <div>
                  <img
                    src="/img/thumbnail-language-map.jpg"
                    alt="World Language Map"
                    class="rounded shadow img-fluid"
                    data-not-lazy
                  />
                </div>
              </router-link>
            </div>
          </div>
          <div class="col-sm-6 mb-5">
            <div class="home-card text-center">
              <h5 class="mb-3">Compare Phrases Across Languages</h5>
              <router-link to="/compare-languages">
                <div>
                  <img
                    src="/img/thumbnail-compare-languages.jpg"
                    alt="Compare phrases across languages on a map"
                    class="rounded shadow img-fluid"
                    data-not-lazy
                  />
                </div>
              </router-link>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-sm-6 mb-5">
            <div class="home-card text-center">
              <h5 class="mb-3">Faces of Languages</h5>
              <router-link to="/language-icons">
                <div>
                  <img
                    src="/img/thumbnail-language-icons.jpg"
                    alt="Faces of Languages"
                    class="rounded shadow img-fluid"
                    data-not-lazy
                  />
                </div>
              </router-link>
            </div>
          </div>
          <div class="col-sm-6 mb-5">
            <div class="home-card text-center">
              <h5 class="mb-3">Compare Online Translators</h5>
              <router-link to="/translators">
                <div>
                  <img
                    src="/img/thumbnail-translators.jpg"
                    alt="Faces of Languages"
                    class="rounded shadow img-fluid"
                    data-not-lazy
                  />
                </div>
              </router-link>
            </div>
          </div>
        </div>
        <client-only>
          <div class="row mb-5">
            <div class="col-sm-12">
              <div class="home-card">
                <h5 class="text-center">More Languages</h5>
                <LanguageList
                  :codes="[
                    'ar',
                    'az',
                    'bn',
                    'br',
                    'bs',
                    'bul',
                    'cat',
                    'ces',
                    'cmn',
                    'cy',
                    'dan',
                    'de',
                    'el',
                    'en',
                    'epo',
                    'es',
                    'fa',
                    'fin',
                    'fr',
                    'gle',
                    'glg',
                    'hak',
                    'he',
                    'hi',
                    'hun',
                    'hr',
                    'hye',
                    'id',
                    'isl',
                    'it',
                    'ja',
                    'ko',
                    'lat',
                    'lav',
                    'lit',
                    'lzh',
                    'msa',
                    'nan',
                    'nl',
                    'no',
                    'pa',
                    'pl',
                    'pt',
                    'ron',
                    'ru',
                    'sr',
                    'swe',
                    'ta',
                    'th',
                    'tl',
                    'tlh',
                    'tr',
                    'uk',
                    'vi',
                    'yue',
                    'zh',
                  ]"
                  class="mt-4"
                  :sort="true"
                />
              </div>
            </div>
          </div>
          <div class="home-card mb-5">
            <h5 class="text-center">All 7,408 Languages</h5>
            <Choose :compact="true" />
          </div>
          <div class="row mb-5">
            <div class="col-sm-12">
              <div class="home-card">
                <h5 class="text-center">Languages by World GDP</h5>
                <LazyLanguagesGDP />
              </div>
            </div>
          </div>
        </client-only>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      hasDashboard: false,
    };
  },
  methods: {
    hasDashboardUpdate(hasDashboard) {
      this.hasDashboard = hasDashboard;
    },
  },
};
</script>

<style lang="scss" scoped>
.czh-links,
.ezh-links {
  padding: 0;
  list-style: none;
}

@media (min-width: 768px) {
  .czh-links,
  .ezh-links {
    column-count: 2;
    column-gap: 1rem;
  }
}

.czh-links a,
.ezh-links a {
  color: #333;
}

.ezh-links a {
  font-size: 0.9em;
}

.z2h-logo {
  color: white;
  text-align: center;
  display: block;
  -webkit-filter: drop-shadow(0 0 20px rgba(0, 0, 0, 0.7));
  filter: drop-shadow(0 0 20px rgba(0, 0, 0, 0.7));
  text-shadow: 0 0 20px rgba(0, 0, 0, 0.7);
}

.z2h-slogan {
  max-height: 10rem;
  position: absolute;
  right: 1rem;
  -webkit-filter: drop-shadow(0 0 20px rgba(0, 0, 0, 0.7));
  filter: drop-shadow(0 0 20px rgba(0, 0, 0, 0.7));
}

.czh-logo,
.ezh-logo {
  width: 12rem;
  max-width: 75%;
  display: block;
}

.intro-text {
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 2rem;
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid hsla(0deg, 0%, 30%, 0.7);
  border-radius: 1rem;
  text-align: left;
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
</style>