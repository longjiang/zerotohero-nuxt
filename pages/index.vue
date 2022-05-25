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
      class="container-fluid pt-4"
      style="overflow: hidden; position: relative"
    >
      <div class="container">
        <div class="row pt-3">
          <div class="col-sm-12">
            <Logo />
          </div>
        </div>
        <client-only>
          <div class="row pt-4" v-if="$auth.loggedIn && $auth.user && $auth.user.first_name">
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
        <div class="row">
          <div class="col-sm-12">
            <div style="line-height: 1.2; color: white; text-align: center">
              <p class="blurb">
                Learn
                <strong>
                  <router-link
                    :to="{ name: 'language-map' }"
                    class="blurb-highlight"
                  >
                    {{ languagesWithVideos.length }} languages 🌏
                  </router-link>
                </strong>
                by watching
                <strong>
                  <router-link
                    :to="{ name: 'discover-shows' }"
                    class="blurb-highlight"
                  >
                    320,364 videos 📺
                  </router-link>
                </strong>
                <br />
              </p>
              <div class="mt-4 mb-4">
                <b-button
                  class="btn btn-success"
                  @click="scrollTo('#mainLanguageList')"
                  style="
                    font-size: 1.2rem;
                    padding: 0.5rem 1.5rem;
                    border-radius: 1rem;
                    box-shadow: #09651d 0px 3px 0px;
                  "
                >
                  Choose Your Language
                  <i class="fa fa-chevron-right ml-2"></i>
                </b-button>
              </div>
              <div>
                <b-button
                  variant="unstyled text-white font-weight-bold"
                  @click="scrollTo('#englishLanguageList')"
                  style="font-size: 1.2rem; text-shadow: 0px 1px 8px black"
                >
                  Learn English >
                </b-button>
                <b-button
                  variant="unstyled text-white font-weight-bold"
                  @click="scrollTo('#chineseLanguageList')"
                  style="font-size: 1.2rem; text-shadow: 0px 1px 8px black"
                >
                  汉语界面 >
                </b-button>
              </div>
              <p class="blurb-secondary">
                TV shows, movies, music, news, audiobooks... with full subtitles
                and dictionary tools, all you need for
                <a
                  class="blurb-highlight"
                  href="https://en.wikipedia.org/wiki/Input_hypothesis"
                  target="_blank"
                >
                  comprehensible input 🎧
                </a>
                .
              </p>
              <client-only>
                <p class="blurb-secondary" v-if="randomLanguage">
                  And yes, we have
                  <router-link
                    :to="`/en/${this.randomLanguage.code}/all-media`"
                    class="blurb-highlight"
                  >
                    {{ this.randomLanguage.name }}!
                    <LanguageFlag
                      v-if="randomLanguage"
                      :language="randomLanguage"
                      :autocycle="true"
                      style="
                        position: relative;
                        bottom: 0.2rem;
                        transform: scale(0.75);
                      "
                    />
                  </router-link>
                </p>
              </client-only>
            </div>
          </div>
        </div>
        <!-- <Sale class="mb-5" style="border-radius: 1rem !important" /> -->

        <div class="row mt-2 mb-3" v-if="!loaded">
          <div class="col-sm-12 text-center pt-3 pb-3 mb-3">
            <div class="home-card mb-0" style="padding: 1rem 1rem 2rem 1rem">
              <Loader :sticky="true" message="Loading more languages . . ." />
            </div>
          </div>
        </div>
        <client-only>
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
          <div class="row mt-4 mb-5" id="chineseLanguageList">
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
          <div class="row mt-4 mb-5" id="mainLanguageList">
            <div class="col-sm-12">
              <div class="home-card p-2">
                <h5 class="text-center mt-3 mb-3">
                  I speak English and want to learn …
                </h5>
                <div class="pl-2 pr-2">
                  <b-form-input
                    v-model="langKeyword"
                    @compositionend.prevent.stop="() => false"
                    placeholder="Search languages"
                  />
                </div>
                <!-- a shorter language list is 'ar,az,bn,br,bs,bul,cat,ces,cy,dan,de,el,en,epo,es,eu,fa,fin,fr,gle,glg,hak,he,hi,hun,hr,hye,id,isl,it,ja,ko,lat,lav,lit,lzh,msa,nan,nl,no,pa,pl,pt,ron,ru,sr,swe,ta,th,tl,tlh,tr,uk,vi,yue,zh' -->
                <LanguageList
                  :showSpeakers="false"
                  :showFeatures="false"
                  :keyword="langKeyword"
                  :codes="languagesWithVideos"
                  class="mt-4"
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
                    More languages
                    <i class="ml-1 fas fa-chevron-right"></i>
                  </router-link>
                </div>
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
        <client-only>
          <div :class="{ 'row mb-5': true, 'd-none': !hasDashboard }">
            <div class="col-sm-12">
              <div class="home-card mb-0" style="padding: 1rem 1rem 2rem 1rem">
                <h5 class="text-center mt-3 mb-3 p-0">
                  Your Words &amp; Phrases
                </h5>
                <LazyDashboard
                  @hasDashboard="hasDashboardUpdate"
                  :showVideos="false"
                  :showFlags="true"
                  style="padding-top: 0.5rem"
                />
              </div>
            </div>
          </div>
        </client-only>
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
    learnEnglishLanguagePairs() {
      if (this.$languages) {
        let english = this.$languages.getSmart("en");
        let langsWithEnDict = this.$languages.l1s.filter(
          (l) => l.dictionaries && l.dictionaries.eng
        );
        let langPairs = langsWithEnDict.map((l1) => {
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
  created() {},
  mounted() {
    this.loaded = true;
  },
  methods: {
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
  margin: 2rem auto 0 auto;
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
</style>