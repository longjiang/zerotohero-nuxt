<router>
  {
    name: 'index',
    path: '/',
    meta: {
      layout: 'full',
      skin: 'dark'
    }
  }
</router>
<template>
  <div>
    <SocialHead
      title="Language Player | Master any language by comprehensible input."
      description="We provide TV shows with subtitles, music with lyrics, live TV channels, phrasebooks with video examples... everything that can help you to learn a language “by osmosis.” Our company, Zero to Hero Education, is also known for our “Chinese Zero to Hero” and “English Zero to Hero” online language courses."
    />
    <div
      class="zerotohero-background"
      :style="`background-image: url(${background})`"
    />
    <div class="gradient-backdrop"></div>
    <div class="gradient-backdrop-2"></div>
    <div
      class="container-fluid safe-padding-top safe-padding-bottom pt-5"
      style="overflow: hidden; position: relative"
    >
      <div class="container">
        <div class="row">
          <div class="col-12 col-md-4 text-center text-sm-left mb-4">
            <Logo layout="horizontal" class="d-inline-block" />
          </div>
          <div class="col-12 col-md-8 text-center text-sm-right mb-3">
            <client-only>
              <nav class="index-nav">
                <router-link
                  class="index-nav-item link-unstyled"
                  to="/go-pro"
                  v-if="$auth.loggedIn && !pro"
                >
                  {{ translate("Go Pro", browserLanguage) }}
                </router-link>
                <span
                  class="index-nav-item"
                  @click="scrollTo('#index-features')"
                  style="cursor: pointer"
                  v-else
                >
                  {{ translate("Features", browserLanguage) }}
                </span>
                <router-link
                  class="index-nav-item link-unstyled"
                  to="/login"
                  v-if="!$auth.loggedIn"
                >
                  {{ translate("Login", browserLanguage) }}
                </router-link>
                <router-link
                  class="index-nav-item btn btn-success"
                  to="/register"
                  v-if="!$auth.loggedIn"
                >
                  {{ translate("Sign Up", browserLanguage) }}
                </router-link>
                <router-link
                  class="index-nav-item link-unstyled"
                  to="/logout"
                  v-if="$auth.loggedIn"
                >
                  {{ translate("Logout", browserLanguage) }}
                </router-link>
                <router-link
                  class="index-nav-item btn btn-success"
                  to="/dashboard"
                  v-if="$auth.loggedIn"
                >
                  {{ translate("Dashboard", browserLanguage) }}
                </router-link>
              </nav>
            </client-only>
          </div>
        </div>
        <div class="row index-section">
          <div class="col-md-7 mb-5">
            <div
              v-if="!playBtnClicked"
              @click="playBtnClicked = true"
              style="cursor: pointer; position: relative"
            >
              <img
                src="/img/btn-play.png"
                alt="Play Button"
                class="btn-play-green"
                data-not-lazy
              />
              <img
                src="/img/screenshot-player.jpg"
                alt="Screenshot"
                style="border-radius: 0.5rem"
                class="img-fluid"
                data-not-lazy
              />
            </div>
            <YouTubeVideo
              youtube="rGRcL_Jr6qo"
              :autoload="true"
              :autoplay="true"
              :fullscreen="true"
              v-if="playBtnClicked"
              style="overflow: hidden; border-radius: 1rem"
            />
          </div>
          <div class="col-md-5">
            <h3 class="text-white mb-2">
              {{
                translate(
                  "Drastically improve your language skills by binge watching videos in the target language.",
                  browserLanguage
                )
              }}
            </h3>
            <p class="text-white">
              {{
                translate(
                  "Languages include Chinese (Mandarin and Cantonese), Japanese, English, French, German, Spanish, Korean, Russian, Italian, and 207 other languages.",
                  browserLanguage
                )
              }}
            </p>
            <div class="mt-4">
              <client-only>
                <template v-if="$auth.loggedIn">
                  <p class="text-white">
                    {{ translate("Welcome back", browserLanguage) }}
                    {{ $auth.user.first_name }}.
                  </p>
                  <router-link class="btn btn-success" to="/dashboard">
                    {{ translate("Go to Dashboard", browserLanguage) }}
                    <i class="ml-1 fas fa-chevron-right"></i>
                  </router-link>
                  <router-link to="/logout" class="text-white ml-3">
                    {{ translate("Or", browserLanguage) }}
                    <u>{{ translate("Logout", browserLanguage) }}</u>
                  </router-link>
                </template>
                <template v-else>
                  <router-link class="btn btn-success" to="/register">
                    {{ translate("Create a Free Account", browserLanguage) }}
                    <i class="ml-1 fas fa-chevron-right"></i>
                  </router-link>
                  <span class="text-white ml-2">
                    {{ translate("Or", browserLanguage) }}
                    <router-link to="/login" class="text-white">
                      <u>
                        {{ translate("Login", browserLanguage) }}
                      </u>
                    </router-link>
                  </span>
                </template>
              </client-only>
            </div>
          </div>
        </div>
        <div class="row index-section" v-if="!native">
          <div class="col-md-6 mb-3 pl-5 pr-4">
            <img
              src="/img/screenshot-mobile-devices.png"
              alt="Screenshot"
              style="border-radius: 0.5rem"
              class="img-fluid"
            />
          </div>
          <div class="col-md-6 mb-3 pl-4">
            <h3 class="text-white mb-2">
              Learn on the go with our mobile apps.
            </h3>
            <p class="text-white">Available on iOS and Android.</p>
            <div class="row">
              <div class="col-12 col-md-6">
                <div>
                  <a
                    href="https://apps.apple.com/us/app/zero-to-hero-languages/id1623985525"
                    target="_blank"
                  >
                    <img
                      data-not-lazy
                      src="/img/btn-ios-app.png"
                      alt="Download on the App Store"
                      style="width: 10rem"
                    />
                    <br />
                    <br />
                    <img
                      src="/img/qr-ios-app-store.png"
                      alt="QR Code"
                      style="width: 9rem; border-radius: 0.5rem"
                    />
                    <p class="mt-3 text-white">
                      <small>
                        Search for “Language Player 2” in the iOS App Store.
                      </small>
                    </p>
                  </a>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div>
                  <a
                    href="https://play.google.com/store/apps/details?id=ca.zerotohero.app"
                    target="_blank"
                  >
                    <img
                      data-not-lazy
                      src="/img/btn-google-play.png"
                      alt="Download on Google Play"
                      style="width: 10rem"
                    />
                    <br />
                    <br />
                    <img
                      src="/img/qr-google-play.png"
                      alt="QR Code"
                      style="width: 9rem; border-radius: 0.5rem"
                    />
                  </a>
                  <p class="mt-3 text-white">
                    <small>
                      <i class="fa-solid fa-down mr-1"></i>
                      Or, download the Android app as an
                      <a
                        href="https://server.chinesezerotohero.com/data/android/language-player-android-2.2.6.apk"
                      >
                        Android Package (APK)
                      </a>
                      .
                    </small>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="row index-section" id="index-features">
          <div class="col-md-4 mb-3">
            <h3 class="text-white mb-2">Massive content library</h3>
            <p class="text-white">
              With 600,000 videos in over 200 languages, you will always find
              something interesting to watch.
            </p>
          </div>
          <div class="col-md-8 mb-3">
            <img
              src="/img/index-massive-content-library.png"
              alt="Screenshot"
              style="border-radius: 0.5rem"
              class="img-fluid"
            />
          </div>
        </div>
        <div class="row">
          <div class="col-md-8 mb-3">
            <img
              src="/img/screenshot-player-fr.png"
              alt="Screenshot"
              style="border-radius: 0.5rem"
              class="img-fluid"
            />
          </div>
          <div class="col-md-4 mb-3">
            <h3 class="text-white mb-2">
              Interactive transcripts with English translation
            </h3>
            <p class="text-white">
              Tap any line in the transcript to play that line. Tap on any word
              to look up.
            </p>
          </div>
        </div>
        <div class="row index-section">
          <div class="col-md-4 mb-3">
            <h3 class="text-white mb-2">See examples of words in videos</h3>
            <p class="text-white">
              Learn words by watching hundreds of video clips that contain this
              word.
            </p>
          </div>
          <div class="col-md-8 mb-3">
            <img
              src="/img/screenshot-subs-search.png"
              alt="Screenshot"
              style="border-radius: 0.5rem"
              class="img-fluid"
            />
          </div>
        </div>
        <div class="row index-section">
          <div class="col-12 mb-3 text-center">
            <h3 class="text-white mb-2">Pricing Options</h3>
            <p class="text-white">
              Get unlimited access with a lifetime Pro account.
            </p>
          </div>
          <div class="col-12">
            <FeatureComparison />
          </div>
        </div>
        <div class="row index-section" id="index-testimonials">
          <div class="col-md-12 mb-3 text-center">
            <h3 class="text-white mb-2">What our users say about us</h3>
            <p class="text-white">
              This is what our users wrote spontaneously in their emails to us,
              <em>without solicitation</em>
              !
            </p>
          </div>
          <div class="col-md-4 mb-3">
            <div class="index-testimonial">
              <p>
                I find most useful when i learn, is the collocation in
                dictionary. (for Chinese) , the picture, the comparing two
                words/character/sentence through videos, the courses, the
                grammar point, able to see songs lyrics with pinyin and many
                more. 😊
              </p>
              <div class="name">Clementina D. (UK)</div>
              <div class="learning">Learning Chinese (zh)</div>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="index-testimonial">
              <p>
                I’m loving this new app and happy I found it, especially as one
                of the languages I’m studying is Estonian and it is actually
                available!
              </p>

              <div class="name">Bailey H. (UK)</div>
              <div class="learning">Learning Estonian (et)</div>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="index-testimonial">
              <p>
                You guys are amazing! Thank you so much for creating Language
                Player. This site is amazing! I became a Pro member today.
                Membership prices are very reasonable, thank you!
              </p>

              <div class="name">Emmanuelle B. (France)</div>
              <div class="learning">Learning Chinese (zh)</div>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="index-testimonial">
              <p>
                I
                <em>live</em>
                on this website! There really is no other service like it.
                Absolutely unparalleled. I recommend it to anyone who wants to
                take their language learning to the next level.
              </p>

              <div class="name">Gary T. (US)</div>
              <div class="learning">Learning Chinese (zh)</div>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="index-testimonial">
              <p>
                I have been using your [Language Player] service to learn
                Chinese alongside my college education for a couple of months,
                and I love it. For me, it was the single best, cheapest, and
                accessible language learning service available on the internet.
                I sincerely congratulate you on designing and implementing it.
              </p>

              <div class="name">Judson B. (US)</div>
              <div class="learning">Learning Chinese (zh)</div>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="index-testimonial">
              <p>
                I love the videos combined with the dictionary. Your site has
                been the best way for me to find content in Chinese and review
                vocab in context.
              </p>

              <div class="name">Jami C. (US)</div>
              <div class="learning">Learning Chinese (zh)</div>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="index-testimonial">
              <p>
                Your page has helped me immensly and I adore your library,
                especially the part where you offer all the videos containing
                one specific word just to hear them over and over again in
                different contexts. I'm an auditive type so this helps me a lot.
              </p>

              <div class="name">Terezija B. (Croatia)</div>
              <div class="learning">Learning Chinese (zh)</div>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="index-testimonial">
              <p>
                I love [Language Player]
                <em>a lot</em>
                and I have started playing with my brand new PRO account today
                for my Korean learning. 😊
              </p>

              <div class="name">Julie-Anne P. (France)</div>
              <div class="learning">Learning Korean (ko)</div>
            </div>
          </div>
        </div>
        <div class="row index-section">
          <div class="col-md-12 mb-3 text-center">
            <h3 class="text-white mb-2">We support 217 languages</h3>
            <p class="text-white">
              Including constructed languages (Esperanto, Klingon), sign
              languages (ASL, KSL), ancient languages (Aramaic, Gothic,
              Classical Chinese), and dialects (Hakka, Min Nan).
            </p>
            <client-only>
              <div class="text-center text-white mt-4">
                <StatsComp variant="summary" />
              </div>
            </client-only>
            <div class="mt-4">
              <img
                src="/img/language-list.jpg"
                alt="List of 217 languages"
                class="rounded img-fluid"
              />
            </div>
            <div class="mt-4 text-white">
              See latest
              <router-link to="/stats" class="link-unstyled">
                <u>stats</u>
              </router-link>
              .
            </div>
          </div>
        </div>
        <div class="row index-section">
          <div class="col-md-12 mb-3 text-center">
            <h3 class="text-white mb-2">Ready to give it a try?</h3>
            <p class="text-white">
              Start by creating a free account, and explore our content library.
            </p>

            <div class="mt-4">
              <client-only>
                <template v-if="$auth.loggedIn">
                  <router-link class="btn btn-success" to="/dashboard">
                    Go to Dashboard
                    <i class="ml-1 fas fa-chevron-right"></i>
                  </router-link>
                  <div class="mt-3 text-white">
                    Or
                    <router-link to="/logout" class="text-white">
                      <u>logout</u>
                    </router-link>
                  </div>
                </template>
                <template v-else>
                  <router-link class="btn btn-success" to="/register">
                    Create a Free Account
                    <i class="ml-1 fas fa-chevron-right"></i>
                  </router-link>
                  <div class="text-white mt-3 text-white">
                    Or
                    <router-link to="/login" class="text-white">
                      <u>Login</u>
                    </router-link>
                  </div>
                </template>
              </client-only>
            </div>
          </div>
        </div>
        <div class="row index-section">
          <div class="col-md-12 mb-3 text-center">
            <h3 class="text-white mb-4">Join our Discord* Server</h3>
            <p class="text-white">
              And connect with people passionate about learning languages, just
              like you!
            </p>
            <p class="text-white small">
              * Discord is a chat and streaming app that allows groups to create
              separate chatrooms (channels) for different purposes.
            </p>
            <a href="https://discord.gg/D7vKcuKXuA" target="_blank">
              <img
                src="/img/screenshot-discord.png"
                alt="Discord"
                style="max-width: 20rem"
                class="inline-block"
              />
            </a>
            <div class="mt-3">
              <a
                href="https://discord.gg/D7vKcuKXuA"
                target="_blank"
                class="btn btn-success"
              >
                <i class="fa-brands fa-discord"></i>
                Language Player Discord Server
              </a>
            </div>
          </div>
        </div>
        <div class="row index-section">
          <div class="col-md-12 mb-3 text-center">
            <h3 class="text-white mb-4">
              Made with ❤️ by language lovers like you.
            </h3>
            <div class="text-left text-white"><LazyFooter /></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Capacitor } from "@capacitor/core";
import { mapState } from "vuex";
import { background } from "@/lib/utils/background";

export default {
  data() {
    return {
      playBtnClicked: false,
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
    ...mapState("fullHistory", ["fullHistory"]),
    background() {
      return background();
    },
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
  height: 150vh;
  width: 100%;
  z-index: 9;
  position: absolute;
  z-index: 0;
  mix-blend-mode: overlay;
}

.gradient-backdrop-2 {
  background: radial-gradient(rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0) 100%);
  height: 150vh;
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

.index-nav {
  .index-nav-item {
    color: white;
    margin: 0 0.5rem;
  }
}

.index-section {
  width: 100vw;
  margin-left: calc((100vw - 100%) / -2);
  padding-left: calc((100vw - 100%) / 2 - 0.5rem);
  padding-right: calc((100vw - 100%) / 2 - 0.5rem);
  padding-top: 3rem;
  padding-bottom: 3rem;
  text-shadow: 0 0 20px black;
  .btn {
    text-shadow: none;
  }
}

.index-section:nth-child(2n + 1) {
  background-color: #000000bb;
}

.btn-play-green {
  position: absolute;
  width: 4rem;
  height: auto;
  top: calc(50% - 2rem);
  left: calc(50% - 2rem);
}

.index-testimonial {
  color: white;
  padding-left: 2rem;
  position: relative;
  .name {
    color: #1bd445;
  }
  .learning {
    opacity: 0.7;
  }
  &::before {
    content: "\f10d";
    font-family: "Font Awesome 6 Pro";
    font-weight: 900;
    position: absolute;
    left: 0;
  }
}
</style>