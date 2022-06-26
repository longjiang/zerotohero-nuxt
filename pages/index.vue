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
        <div class="row mt-5">
          <div class="col-sm-12 mb-3" style="max-width: 40rem; margin: 0 auto">
            <YouTubeVideo
              youtube="mzpu-2FV4E4"
              :autoload="true"
              style="overflow: hidden; border-radius: 1rem"
            />
          </div>
        </div>
        <div class="row pt-3">
          <div class="col-sm-12">
            <!-- <FeedbackPrompt /> -->
            <!-- <Logo class="mt-4 mb-3" /> -->
            <p class="blurb text-white text-center">
              {{ translate("Learn languages with videos.", browserLanguage) }}
            </p>
            <client-only>
              <div class="text-center text-white mt-4">
                <StatsComp variant="summary" />
              </div>
            </client-only>
          </div>
        </div>
        <div class="row pt-3">
          <div class="col-sm-12 mt-5 text-center">
            <router-link class="btn btn-success" to="/register">Create a Free Account <i class="ml-1 fas fa-chevron-right"></i></router-link>
            <p class="mt-4 text-white">Already have an account? <router-link to="/login" class="text-white"><u>Login</u></router-link></p>
          </div>
        </div>

        <client-only>
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
        </client-only>
        <!-- <Sale class="mb-5" style="border-radius: 1rem !important" /> -->
        
        <div class="mt-5 text-center mb-5" v-if="!loaded">
          <p>App is asleep due to inactivity.</p>
          <router-link
            :to="{ path: lastFullHistoryPath || '/' }"
            class="btn btn-success"
          >
            Reactivate
          </router-link>
        </div>
      </div>
      <div class="row mt-5 bg-light">
        <div class="col-sm-12 pt-5">
          <h5 class="text-center mb-3">Follow us on ...</h5>
          <SocialLogos />
          <div class="mb-5" />
          <LazyFooter />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Capacitor } from "@capacitor/core";
import { mapState } from "vuex";

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
    ...mapState("fullHistory", ["fullHistory"]),
    lastFullHistoryPath() {
      if (this.fullHistory) {
        let lastFullHistoryItem = this.fullHistory[this.fullHistory.length - 1];
        if (lastFullHistoryItem && lastFullHistoryItem.path) {
          return lastFullHistoryItem.path;
        }
      }
    },
    pro() {
      return [1, 4].includes(Number(this.$auth.user?.role)) ? true : false;
    },
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

::v-deep .stats-summary {
  color: #ccc;
}
</style>