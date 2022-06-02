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
    <div class="gradient-backdrop"></div>
    <div class="gradient-backdrop-2"></div>
    <div
      class="container-fluid safe-padding-top safe-padding-bottom"
      style="overflow: hidden; position: relative"
    >
      <div class="container">
        <div class="row pt-3">
          <div class="col-sm-12">
            <div class="user-links">
              <span
                to="/profile"
                v-if="
                  $auth && $auth.loggedIn && $auth.user && $auth.user.first_name
                "
              >
                <router-link to="/logout">Logout</router-link>
              </span>
              <span v-else>
                <router-link to="/login">Login</router-link>
              </span>
            </div>
            <!-- <FeedbackPrompt /> -->
            <Logo class="mt-4 mb-3" />
            <p class="blurb text-white text-center">
              Learn languages naturally with videos.
            </p>
            <div class="text-center text-white mt-3">
              <StatsComp variant="summary" />
              <div class="mt-2">
                <router-link :to="{ name: 'stats' }" style="color: #1bd445">
                  <small>Full stats <i class="fas fa-angle-right ml-1"></i></small>
                </router-link>
              </div>
            </div>
          </div>
        </div>
        <client-only>
          <div
            class="row pt-4 mb-3"
            v-if="
              $auth.loggedIn &&
              $auth.user &&
              $auth.user.first_name &&
              $store.state.progress.progress &&
              Object.keys($store.state.progress.progress).length > 0
            "
          >
            <div class="col-sm-12">
              <div class="home-card p-2 pt-4 pb-4 bg-white">
                <h5 class="text-center mt-2 mb-1">
                  {{ $auth.user.first_name }}’s Language Dashboard
                </h5>
                <LazyDashboard />
              </div>
            </div>
          </div>
        </client-only>
        <div class="row" v-if="!native">
          <div class="col-sm-12">
            <div style="line-height: 1.2; color: white; text-align: center">
              <div class="mt-4 mb-4">
                <a
                  href="https://apps.apple.com/us/app/zero-to-hero-languages/id1623985525"
                  target="_blank"
                >
                  <img
                    data-not-lazy
                    src="/img/logo-ios-app.png"
                    alt="Download on the App Store"
                    style="width: 10rem"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
        <!-- <Sale class="mb-5" style="border-radius: 1rem !important" /> -->
        <client-only>
          <div class="row mt-4" v-if="language('en')">
            <div class="col-sm-6 col-md-4 mb-4">
              <div class="home-card p-4">
                <div class="text-center">
                  <router-link :to="`/en/zh/all-media`" class="link-unstyled">
                    <LanguageFlag
                      :language="language('zh')"
                      style="transform: scale(2); margin: 1rem"
                      :autocycle="true"
                    />
                    <h5 class="strong mt-2">Learn Chinese</h5>
                  </router-link>
                  <div class="row mt-4">
                    <div class="col-6 col-sm-12 col-md-12 col-lg-6">
                      <ul
                        style="font-size: 0.9em"
                        class="list-unstyled text-left mb-0"
                      >
                        <li style="white-space: nowrap">
                          <router-link
                            to="/en/zh/all-media"
                            class="link-unstyled"
                          >
                            <b>Mandarin</b>
                          </router-link>
                        </li>
                        <li style="white-space: nowrap">
                          <router-link
                            to="/en/yue/all-media"
                            class="link-unstyled"
                          >
                            <b>Cantonese</b>
                          </router-link>
                        </li>
                        <li style="white-space: nowrap">
                          <router-link
                            to="/zh/nan/all-media"
                            class="link-unstyled"
                          >
                            Min Nan
                          </router-link>
                        </li>
                        <li style="white-space: nowrap">
                          <router-link
                            to="/zh/hak/all-media"
                            class="link-unstyled"
                          >
                            Hakka
                          </router-link>
                        </li>
                      </ul>
                    </div>
                    <div class="col-6 col-sm-12 col-md-12 col-lg-6">
                      <ul
                        style="font-size: 0.9em"
                        class="list-unstyled text-left mb-0"
                      >
                        <li style="white-space: nowrap">
                          <router-link
                            to="/en/wuu/all-media"
                            class="link-unstyled"
                          >
                            Wu
                          </router-link>
                        </li>
                        <li style="white-space: nowrap">
                          <router-link
                            to="/en/lzh/all-media"
                            class="link-unstyled"
                          >
                            Classical Chinese
                          </router-link>
                        </li>
                        <li style="white-space: nowrap">
                          <router-link
                            to="/en/ltc/all-media"
                            class="link-unstyled"
                          >
                            Middle Chinese
                          </router-link>
                        </li>
                        <li style="white-space: nowrap">
                          <router-link
                            to="/en/och/all-media"
                            class="link-unstyled"
                          >
                            Old Chinese
                          </router-link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-sm-6 col-md-4 mb-4">
              <div class="home-card p-4">
                <div class="text-center">
                  <router-link
                    :to="`/${browserLanguage}/en/all-media`"
                    class="link-unstyled"
                  >
                    <LanguageFlag
                      :language="language('en')"
                      style="transform: scale(2); margin: 1rem"
                      :autocycle="true"
                    />
                    <h5 class="strong mt-2">
                      {{ translate("Learn English", browserLanguage) }}
                    </h5>
                  </router-link>
                  <div class="row mt-4">
                    <div class="col-6 col-sm-12 col-md-12 col-lg-6">
                      <ul
                        style="font-size: 0.9em"
                        class="list-unstyled text-left mb-0"
                      >
                        <li style="white-space: nowrap">
                          <router-link
                            to="/ru/en/all-media"
                            class="link-unstyled"
                          >
                            Выучить англ. язык
                          </router-link>
                        </li>
                        <li style="white-space: nowrap">
                          <router-link
                            to="/de/en/all-media"
                            class="link-unstyled"
                          >
                            Lerne Englisch
                          </router-link>
                        </li>
                        <li style="white-space: nowrap">
                          <router-link
                            to="/pt/en/all-media"
                            class="link-unstyled"
                          >
                            Aprender inglês
                          </router-link>
                        </li>
                        <li style="white-space: nowrap">
                          <router-link
                            to="/es/en/all-media"
                            class="link-unstyled"
                          >
                            Aprende inglés
                          </router-link>
                        </li>
                      </ul>
                    </div>
                    <div class="col-6 col-sm-12 col-md-12 col-lg-6">
                      <ul
                        style="font-size: 0.9em"
                        class="list-unstyled text-left mb-0"
                      >
                        <li style="white-space: nowrap">
                          <router-link
                            to="/fr/en/all-media"
                            class="link-unstyled"
                          >
                            Apprendre l’anglais
                          </router-link>
                        </li>
                        <li style="white-space: nowrap">
                          <router-link
                            to="/it/en/all-media"
                            class="link-unstyled"
                          >
                            Impara l’inglese
                          </router-link>
                        </li>
                        <li style="white-space: nowrap">
                          <router-link
                            to="/ja/en/all-media"
                            class="link-unstyled"
                          >
                            英語を習う
                          </router-link>
                        </li>
                        <li style="white-space: nowrap">
                          <b
                            href="#englishLanguageList"
                            class="link-unstyled"
                            style="cursor: pointer"
                            @click="scrollTo('#englishLanguageList')"
                          >
                            Learn English
                          </b>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-sm-12 col-md-4 mb-4">
              <div class="home-card pb-2 pt-4">
                <h5 class="text-center mb-3">Learn</h5>
                <div class="row">
                  <div
                    v-for="code in ['es', 'de', 'fr', 'it', 'ja', 'ko']"
                    :key="`quick-lang-${code}`"
                    class="
                      text-center
                      col-4 col-sm-4 col-md-6 col-lg-4
                      mt-2
                      mb-2
                    "
                  >
                    <router-link
                      :to="`/en/${code}/all-media`"
                      class="link-unstyled"
                    >
                      <LanguageFlag
                        :language="language(code)"
                        :autocycle="true"
                        style="transform: scale(1.5); margin: 0 1rem 1rem 1rem"
                      />
                      <h6 class="strong" style="font-size: 0.9em">
                        {{ language(code).name }}
                      </h6>
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-sm-6 col-md-4"></div>
          </div>
          <div
            class="row mb-4"
            id="chineseLanguageList"
            v-if="browserLanguage && browserLanguage === 'zh'"
          >
            <div class="col-sm-12">
              <div class="home-card p-2">
                <h5 class="text-center mt-3 mb-3">可用汉语界面学习的语言</h5>
                <LanguageList
                  :showSpeakers="false"
                  :showFeatures="false"
                  :keyword="langKeyword"
                  :pairs="learnFromChineseLanguagePairs"
                  class="mt-4"
                  :sort="true"
                  :showFlags="true"
                  variant="grid"
                />
              </div>
            </div>
          </div>
          <div class="row mt-3 mb-5" id="mainLanguageList">
            <div class="col-sm-12">
              <div class="home-card p-2">
                <h5 class="text-center mt-3 mb-3">Learn More Languages</h5>
                <div class="mb-3" style="display: flex">
                  <b-form-input
                    v-model="langKeyword"
                    style="flex: 1; margin-right: 0.5rem"
                    @compositionend.prevent.stop="() => false"
                    placeholder="Search languages"
                  />
                  <router-link
                    class="btn btn-success d-block"
                    to="/language-map"
                  >
                    <i class="fas fa-globe-asia mr-1"></i>
                    <span class="d-none d-sm-inline">Language</span>
                    Map
                    <i class="ml-1 fas fa-chevron-right"></i>
                  </router-link>
                </div>
                <!-- a shorter language list is 'ar,az,bn,br,bs,bul,cat,ces,cy,dan,de,el,en,epo,es,eu,fa,fin,fr,gle,glg,hak,he,hi,hun,hr,hye,id,isl,it,ja,ko,lat,lav,lit,lzh,msa,nan,nl,no,pa,pl,pt,ron,ru,sr,swe,ta,th,tl,tlh,tr,uk,vi,yue,zh' -->
                <LanguageList
                  :showSpeakers="false"
                  :showFeatures="false"
                  :keyword="langKeyword"
                  :codes="languagesWithVideos"
                  class="mt-2"
                  :sort="true"
                  :showFlags="true"
                  variant="grid"
                />
                <div class="text-center mt-1 p-1">
                  <router-link
                    class="btn btn-success d-block"
                    to="/language-map"
                  >
                    <i class="fas fa-globe-asia mr-1"></i>
                    See Even More Languages on a Map
                    <i class="ml-1 fas fa-chevron-right"></i>
                  </router-link>
                </div>
              </div>
            </div>
          </div>
          <div class="row mt-4 mb-5" id="englishLanguageList">
            <div class="col-sm-12">
              <div class="home-card p-2">
                <h5 class="text-center mt-3 mb-3">Learn English from...</h5>
                <LanguageList
                  :showSpeakers="false"
                  :showFeatures="false"
                  :keyword="langKeyword"
                  :pairs="learnEnglishLanguagePairs"
                  class="mt-4"
                  :sort="true"
                  :showFlags="true"
                  variant="grid"
                />
              </div>
            </div>
          </div>
        </client-only>

        <div class="row mb-3">
          <div class="col-sm-6 mb-4">
            <div class="home-card">
              <router-link to="/en/zh/all-media">
                <img
                  src="/img/czh-logo-dark.png"
                  class="czh-logo"
                  data-not-lazy
                />
              </router-link>
              <hr />
              <ul class="czh-links mb-0">
                <li>
                  <router-link
                    to="/en/zh/online-courses"
                    style="color: #fd4f1c; font-weight: bold"
                  >
                    HSK Courses
                  </router-link>
                </li>
                <li>
                  <router-link to="/en/zh/tv-shows">TV Shows</router-link>
                </li>
                <li>
                  <router-link to="/en/zh/dictionary">
                    Video Dictionary
                  </router-link>
                </li>
                <li>
                  <router-link to="/en/zh/phrasebooks">Phrasebooks</router-link>
                </li>
                <li>
                  <router-link to="/en/zh/reader">Reader</router-link>
                </li>
                <li>
                  <router-link to="/en/zh/grammar">Grammar</router-link>
                </li>
                <li>
                  <router-link to="/en/zh/live-tv">Live TV</router-link>
                </li>
                <li>
                  <router-link to="/en/zh/resource/list/all/all">
                    Resources
                  </router-link>
                </li>
              </ul>
            </div>
          </div>
          <div class="col-sm-6 mb-4">
            <div class="home-card">
              <router-link to="/zh/en/all-media">
                <img
                  src="/img/ezh-logo-dark.png"
                  class="ezh-logo"
                  data-not-lazy
                />
              </router-link>
              <hr />
              <ul class="ezh-links mb-0">
                <li>
                  <router-link
                    to="/zh/en/online-courses"
                    style="color: #1b3e76; font-weight: bold"
                  >
                    CEFR Courses 视频教程
                  </router-link>
                </li>
                <li>
                  <router-link to="/zh/en/dictionary">
                    Dictionary 视频词典
                  </router-link>
                </li>
                <li>
                  <router-link to="/zh/en/phrasebooks">
                    Phrasebooks 短语集
                  </router-link>
                </li>
                <li>
                  <router-link to="/zh/en/tv-shows">
                    TV Shows 电视节目
                  </router-link>
                </li>
                <li>
                  <router-link to="/zh/en/talks">Channels 油管频道</router-link>
                </li>
                <li>
                  <router-link to="/zh/en/audiobooks">
                    Audiobooks 有声书
                  </router-link>
                </li>
                <li>
                  <router-link to="/zh/en/live-tv">
                    Live TV 电视直播
                  </router-link>
                </li>
                <li>
                  <router-link to="/zh/en/reader">
                    Reader 文字阅读器
                  </router-link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="row mb-5">
          <div class="col-sm-12">
            <div class="home-card">
              <h5 class="text-center mb-3">Find Us On</h5>
              <SocialLogos />
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-sm-6 mb-5">
            <div class="home-card text-center">
              <h5 class="mb-3">Discover TV Shows Across Languages</h5>
              <router-link to="/discover-shows">
                <img
                  src="/img/thumbnail-discover-shows.jpg"
                  alt="Discover TV Shows Across Languages"
                  class="rounded shadow img-fluid"
                  data-not-lazy
                />
              </router-link>
            </div>
          </div>
          <div class="col-sm-6 mb-5">
            <div class="home-card">
              <h5 class="mb-3 text-center">Other Interlingual Features</h5>
              <ul>
                <li class="mt-1 mb-1">
                  <router-link to="/compare-languages">
                    <b>Compare Phrases Across Languages</b>
                  </router-link>
                  – Search for any word or phrase in English, and see the same
                  phrase across all languages on a map.
                </li>
                <li class="mt-1 mb-1">
                  <router-link to="/language-icons">
                    <b>Face of the Language</b>
                  </router-link>
                  – Images of famous people who speak one of the 300 languages
                  listed.
                </li>
                <li class="mt-1 mb-1">
                  <router-link to="/translators">
                    <b>Compare Online Translators</b>
                  </router-link>
                  – Find out which online translator (e.g. Google Translate) has
                  the ability to translate which language.
                </li>
              </ul>
            </div>
          </div>
        </div>
        <client-only>
          <div class="row">
            <div class="col-sm-12">
              <div class="home-card">
                <h5 class="text-center">Languages by % of World GDP</h5>
                <LazyLanguagesGDP />
              </div>
            </div>
          </div>
        </client-only>
      </div>
      <div class="row mt-5 bg-dark text-white">
        <div class="col-sm-12">
          <LazyFooter />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Capacitor } from "@capacitor/core";

export default {
  data() {
    return {
      langKeyword: undefined,
      loaded: false,
      hasDashboard: false,
      // The following list is SORTED by number of videos available.
      languagesWithVideos:
        "zho,eng,kor,deu,ita,jpn,fra,spa,cat,rus,vie,tur,yue,ukr,nld,ara,nor,ell,swe,cmn,hin,pol,nan,fas,ase,ind,por,tha,hun,kat,ron,srp,tgl,msa,wol,tam,epo,heb,slk,hrv,cym,hye,ben,guj,bul,dan,isl,mar,ces,kaz,mon,lav,tlh,glg,est,bre,lit,lat,mkd,aze,fin,sun,pan,cnr,lzh,ins,tel,hbs,sqi,urd,bel,bod,gle,mya,asm,kan,uzb,hak,mri,mlt,arb,mal,ltz,ckb,grc,gla,ami,lao,khm,tat,fao,san,que,yor,nsl,smo,sin,som,jav,kur,slv,bak,afr,amh,ceb,kir,fsl,eus,fry,hbo,wuu,bos,oci,snd,kac,swa,yid,nep,non,tir,orm,prs,srm,sco,gsw,crh,mxv,pes,roh,mlg,bho,scn,hil,kvk,nav,cop,got,hsn,ina,krl,lin,nob,abk,nno,ryu,xho,sah,uig,zha,zul,aib,cpx,grn,hni,mnp,pus,sli,tgk,zzj,ang,csb,hau,ojp,sme,ain,cjy,kal,lad,acu,arc,dsb,dzo,glv,iii,ksw,ltc,sux,ybe,akk,aou,awa,aym,fur,hne,kab,kpe,mai,mhx,nqo,acf,bsk,byq,czo,gan,gkp,goh,ibo,ipk,min,mni,och,ori,pis,pms,srd,ssw,vec,vol,xpe,zzj,arz,enm,jam,kok,lkt,osc,sjn,tsd".split(
          ","
        ),
    };
  },
  computed: {
    native() {
      return Capacitor.isNativePlatform();
    },
    browserLanguage() {
      if (process.browser) {
        let code = navigator.language.replace(/-.*/, "");
        if (
          this.langsWithEnDict &&
          this.langsWithEnDict.find((l) => l.code === code)
        )
          return code;
      }
      return "en";
    },
    langsWithEnDict() {
      if (this.$languages) {
        let langsWithEnDict = this.$languages.l1s.filter(
          (l) => l.dictionaries && l.dictionaries.eng
        );
        return langsWithEnDict;
      }
    },
    learnEnglishLanguagePairs() {
      if (this.langsWithEnDict) {
        let english = this.$languages.getSmart("en");
        let langPairs = this.langsWithEnDict.map((l1) => {
          return { l1, l2: english };
        });
        return langPairs.sort(
          (a, b) => a.l1.name.localeCompare(b.l1.name),
          "en"
        );
      }
    },
    learnFromChineseLanguagePairs() {
      if (this.$languages) {
        let chinese = this.$languages.getSmart("zh");
        let langPairs = Object.keys(chinese.dictionaries).map((l2) => {
          return { l1: chinese, l2: this.$languages.getSmart(l2) };
        });
        return langPairs;
      }
    },
    randomLanguage() {
      if (this.$languages) {
        let randomLanguage = this.randomArrayItem(
          this.languagesWithVideos.slice(0, 141)
        );
        let randomLanguageObj = this.$languages.getSmart(randomLanguage);
        return randomLanguageObj;
      }
    },
  },
  async created() {
    await this.$languagesPromise;
  },
  mounted() {
    this.loaded = true;
  },
  methods: {
    translate(text, code) {
      if (this.$languages) return this.$languages.translate(text, code);
      else return text;
    },
    language(code) {
      if (this.$languages) return this.$languages.getSmart(code);
    },
    scrollTo(selector) {
      document.querySelector(selector).scrollIntoView({
        behavior: "smooth",
      });
    },
    hasDashboardUpdate(hasDashboard) {
      this.hasDashboard =
        hasDashboard &&
        (hasDashboard.includes("words") || hasDashboard.includes("phrases"));
    },
    countryCode(l2Code) {
      return this.$languages
        ? this.$languages.countryCode(this.$languages.getSmart(l2Code))
        : undefined;
    },
    randomArrayItem(array, start = 0, length = false) {
      length = length || array.length;
      array = array.slice(start, length);
      let index = Math.floor(Math.random() * array.length);
      return array[index];
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

.gradient-backdrop {
  background: radial-gradient(rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 100%);
  height: 100vh;
  width: 100%;
  z-index: 9;
  position: absolute;
  z-index: 0;
  mix-blend-mode: overlay;
}

.gradient-backdrop-2 {
  background: radial-gradient(rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0) 100%);
  height: 100vh;
  width: 100%;
  z-index: 9;
  position: absolute;
  z-index: 0;
}

.blurb {
  font-size: 1.3rem;
  max-width: 45rem;
  margin: 0 auto 0 auto;
  line-height: 1.5;
}

.blurb-highlight {
  color: #1bd445;
  font-weight: bold;
  text-shadow: #004a5c;
}

.blurb-secondary {
  font-size: 1.1rem;
  max-width: 35rem;
  margin: 1rem auto 0 auto;
  line-height: 1.5;
}

.user-links {
  position: absolute;
  right: 1rem;
  top: 0;
  a {
    color: white;
    font-weight: bold;
    text-shadow: 0 0 15px rgba(0, 0, 0);
    margin-left: 0.5rem;
  }
}

::v-deep .stats-summary {
  color: #ccc;
}
</style>