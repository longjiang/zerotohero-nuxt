<template>
  <div>
    <client-only>
      <div class="row mt-4" v-if="language('en')">
        <div class="col-sm-6 col-md-4 mb-4">
          <div class="home-card p-4">
            <div class="text-center">
              <router-link :to="`/en/zh/explore-media`" class="link-unstyled">
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
                      <router-link to="/en/zh/explore-media" class="link-unstyled">
                        <b>Mandarin</b>
                      </router-link>
                    </li>
                    <li style="white-space: nowrap">
                      <router-link to="/en/yue/explore-media" class="link-unstyled">
                        <b>Cantonese</b>
                      </router-link>
                    </li>
                    <li style="white-space: nowrap">
                      <router-link to="/en/ltc/explore-media" class="link-unstyled">
                        Middle Chinese
                      </router-link>
                    </li>
                    <li style="white-space: nowrap">
                      <router-link to="/en/och/explore-media" class="link-unstyled">
                        Old Chinese
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
                      <router-link to="/en/wuu/explore-media" class="link-unstyled">
                        Wu
                      </router-link>
                    </li>
                    <li style="white-space: nowrap">
                      <router-link to="/zh/nan/explore-media" class="link-unstyled">
                        学习闽南话
                      </router-link>
                    </li>
                    <li style="white-space: nowrap">
                      <router-link to="/zh/hak/explore-media" class="link-unstyled">
                        学习客家话
                      </router-link>
                    </li>
                    <li style="white-space: nowrap">
                      <router-link to="/zh/lzh/explore-media" class="link-unstyled">
                        学习文言文
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
                :to="`/${browserLanguage}/en/explore-media`"
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
                      <router-link to="/ru/en/explore-media" class="link-unstyled">
                        Выучить англ. язык
                      </router-link>
                    </li>
                    <li style="white-space: nowrap">
                      <router-link to="/de/en/explore-media" class="link-unstyled">
                        Lerne Englisch
                      </router-link>
                    </li>
                    <li style="white-space: nowrap">
                      <router-link to="/pt/en/explore-media" class="link-unstyled">
                        Aprender inglês
                      </router-link>
                    </li>
                    <li style="white-space: nowrap">
                      <router-link to="/es/en/explore-media" class="link-unstyled">
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
                      <router-link to="/fr/en/explore-media" class="link-unstyled">
                        Apprendre l’anglais
                      </router-link>
                    </li>
                    <li style="white-space: nowrap">
                      <router-link to="/zh/en/explore-media" class="link-unstyled">
                        学英语
                      </router-link>
                    </li>
                    <li style="white-space: nowrap">
                      <router-link to="/ja/en/explore-media" class="link-unstyled">
                        英語を習う
                      </router-link>
                    </li>
                    <li style="white-space: nowrap">
                      <b
                        href="#englishLanguageList"
                        class="link-unstyled text-success"
                        style="cursor: pointer"
                        @click="scrollTo('#englishLanguageList')"
                      >
                        More
                        <i class="fa fa-chevron-down"></i>
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
                class="text-center col-4 col-sm-4 col-md-6 col-lg-4 mt-2 mb-2"
              >
                <router-link
                  :to="`/en/${code}/explore-media`"
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
            <h5 class="text-center mt-3 mb-3">
              {{ translate("Learn More Languages", browserLanguage) }}
            </h5>
            <div class="mb-3 pl-1 pr-1" style="display: flex">
              <b-form-input
                v-model="langKeyword"
                style="flex: 1; margin-right: 0.5rem"
                @compositionend.prevent.stop="() => false"
                :placeholder="translate('Search languages', browserLanguage)"
              />
              <router-link class="btn btn-success d-block" to="/language-map">
                <i class="fas fa-map-marker-alt mr-1"></i>
                <span class="d-none d-sm-inline">
                  {{ translate("Find on Map", browserLanguage) }}
                </span>
                <span class="d-xs-inline d-sm-none">
                  {{ translate("Map", browserLanguage) }}
                </span>
              </router-link>
            </div>
            <!-- a shorter language list is 'ar,az,bn,br,bs,bul,cat,ces,cy,dan,de,el,en,epo,es,eu,fa,fin,fr,gle,glg,hak,he,hi,hun,hr,hye,id,isl,it,ja,ko,lat,lav,lit,lzh,msa,nan,nl,no,pa,pl,pt,ron,ru,sr,swe,ta,th,tl,tlh,tr,uk,vi,yue,zh' -->
            <LanguageList
              v-if="langKeyword"
              :showSpeakers="false"
              :showFeatures="false"
              :keyword="langKeyword"
              :codes="languagesWithVideos"
              class="mt-2"
              :sort="true"
              :showFlags="true"
              variant="grid"
            />
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
</template>


<script>

export default {
  data() {
    return {
      langKeyword: undefined,
      hasDashboard: false,
      // The following list is SORTED by number of videos available.
      languagesWithVideos:
        "zho,eng,kor,deu,ita,jpn,fra,spa,cat,rus,vie,tur,yue,ukr,nld,ara,nor,ell,swe,cmn,hin,pol,nan,fas,ase,ind,por,tha,hun,kat,ron,srp,tgl,msa,wol,tam,epo,heb,slk,hrv,cym,hye,ben,guj,bul,dan,isl,mar,ces,kaz,mon,lav,tlh,glg,est,bre,lit,lat,mkd,aze,fin,sun,pan,cnr,lzh,ins,tel,hbs,sqi,urd,bel,bod,gle,mya,asm,kan,uzb,hak,mri,mlt,arb,mal,ltz,ckb,grc,gla,ami,lao,khm,tat,fao,san,que,yor,nsl,smo,sin,som,jav,kur,slv,bak,afr,amh,ceb,kir,fsl,eus,fry,hbo,wuu,bos,oci,snd,kac,swa,yid,nep,non,tir,orm,prs,srm,sco,gsw,crh,mxv,pes,roh,mlg,bho,scn,hil,kvk,nav,cop,got,hsn,ina,krl,lin,nob,abk,nno,ryu,xho,sah,uig,zha,zul,aib,cpx,grn,hni,mnp,pus,sli,tgk,zzj,ang,csb,hau,ojp,sme,ain,cjy,kal,lad,acu,arc,dsb,dzo,glv,iii,ksw,ltc,sux,ybe,akk,aou,awa,aym,fur,hne,kab,kpe,mai,mhx,nqo,acf,bsk,byq,czo,gan,gkp,goh,ibo,ipk,min,mni,och,ori,pis,pms,srd,ssw,vec,vol,xpe,zzj,arz,enm,jam,kok,lkt,osc,sjn,tsd".split(
          ","
        ),
    };
  },
  computed: {
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
    pro() {
      return this.forcePro || this.$store.state.subscriptions.active;
    },
  },
  async created() {
    await this.$languagesPromise;
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

.go-pro-link,
.user-links {
  position: absolute;
  top: 0;
  a {
    color: white;
    font-weight: bold;
    text-shadow: 0 0 15px rgba(0, 0, 0);
    margin-left: 0.5rem;
  }
}

.go-pro-link {
  left: 1rem;
}

.user-links {
  right: 1rem;
}

:deep(.stats-summary) {
  color: #ccc;
}
</style>