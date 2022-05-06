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
    <SocialHead title="Zero to Hero Languages | Master any language by comprehensible input."
      description="We provide live TV channels in the target language, TV shows with subtitles, music with lyrics, phrasebooks with video examples... everything that can help you to learn a language “by osmosis.” We are also known for our “Chinese Zero to Hero” and “English Zero to Hero” online language courses." />
    <div class="container-fluid pt-4" style="overflow: hidden; position: relative">
      <div class="container">
        <div class="row pt-5 mb-5">
          <div class="col-sm-12">
            <div class="z2h-logo" style="line-height: 1.2">
              <span style="font-size: 3rem">
                <img src="/img/czh-icon.png" style="height: 7rem; margin-right: 0.25rem; margin-bottom: 0.5rem" data-not-lazy /><br /><b>zerotohero.ca</b>
              </span>
              <p style="font-size: 1.6rem; max-width: 45rem; margin: 2rem auto 0 auto; line-height: 1.5;">
                Learn <strong><span style="color: #fd4f1c">{{ languagesWithVideos.length }} languages</span></strong> by
                “comprehensible input” through a collection of <strong><span style="color:#fd4f1c">320,364
                    videos</span></strong>, including TV shows, movies, music, news, audiobooks, with full subtitles and
                a popup dictionary.
              </p>
              <p style="font-size: 1.6rem; max-width: 45rem; margin: 1rem auto 0 auto; line-height: 1.5;">And yes, we
                have
                <router-link :to="`/en/${this.randomLanguage[1]}`" style="color: #fd4f1c; font-weight: bold;">{{
                    this.randomLanguage[0]
                }}</router-link>.
              </p>
            </div>
          </div>
        </div>
        <!-- <Sale class="mb-5" style="border-radius: 1rem !important" /> -->
        <div class="row mb-5">
          <div class="col-sm-12">
            <h4 class="text-center">
              <router-link class="btn btn-success" to="/language-map" style="font-size: 1.5rem">
                Pick Your Language
                <i class="fa fa-chevron-right ml-2"></i>
              </router-link>
            </h4>
          </div>
        </div>

        <div class="row mb-5">
          <div class="col-sm-12">
            <div class="home-card">
              <h5 class="text-center mb-3">Find Us On</h5>
              <div class="home-card-logos text-center" style="line-height: 2rem">
                <a href="https://twitter.com/zerotohero_ca">
                  <img src="/img/twitter-text.png" style="height: 0.9rem; padding: 0 0.5rem" data-not-lazy />
                </a>
                <a href="https://www.youtube.com/channel/UCQ3IlLg5VGeydxtswBoyt6A">
                  <img src="/img/logo-youtube.png" style="height: 1.2rem; padding: 0 0.5rem" data-not-lazy />
                </a>
                <a href="https://www.instagram.com/chinesezerotohero/">
                  <img src="/img/logo-instagram.png" style="height: 1.4rem; padding: 0 0.5rem" data-not-lazy />
                </a>
                <a href="http://chinesezerotohero.teachable.com/">
                  <img src="/img/logo-teachable.png" style="height: 1.4rem; padding: 0 0.5rem" data-not-lazy />
                </a>
                <a href="http://t.me/zerotohero_zh">
                  <img src="/img/logo-telegram.png" style="height: 1.4rem; padding: 0 0.5rem" data-not-lazy />
                </a>
                <a href="https://m.cctalk.com/inst/stevmab3">
                  <img src="/img/logo-cctalk.png" style="height: 1.2rem" data-not-lazy />
                </a>
                &nbsp;&nbsp;
                <a href="https://space.bilibili.com/253569339">
                  <img src="/img/logo-bilibili.png" style="height: 1.2rem" data-not-lazy />
                </a>
                &nbsp;&nbsp;
                <a href="https://v.douyin.com/eNJCcD8/">
                  <img src="/img/logo-douyin.png" style="height: 1.4rem" data-not-lazy />
                </a>
                &nbsp;&nbsp;
                <a href="https://www.xiaohongshu.com/user/profile/5fad77c0000000000100696e">
                  <img src="/img/logo-xiaohongshu.png" style="height: 1.4rem" data-not-lazy />
                </a>
                <!-- &nbsp;&nbsp;
                <router-link to="/zh/en/contact-us">
                  <img
                    src="/img/logo-wechat.png"
                    style="height: 1.4rem"
                    data-not-lazy
                  />
                </router-link> -->
              </div>
            </div>
          </div>
        </div>

        <div class="row" v-if="!loaded">
          <div class="col-sm-12 text-center pt-3 pb-3 text-white">
            Loading languages ...
          </div>
        </div>

        <client-only>
          <div :class="{ 'row mb-5': true, 'd-none': !hasDashboard }">
            <div class="col-sm-12">
              <div class="home-card mb-0" style="padding: 1rem">
                <h5 class="text-center mt-3 mb-3">
                  Your Language-Learning Dashboard
                </h5>
                <LazyDashboard @hasDashboard="hasDashboardUpdate" style="padding-top: 0.5rem" />
              </div>
            </div>
          </div>
        </client-only>
        <div class="row">
          <div class="col-sm-6 mb-5">
            <div class="home-card">
              <router-link to="/en/zh">
                <img src="/img/czh-logo-dark.png" class="czh-logo" data-not-lazy />
              </router-link>
              <hr />
              <ul class="czh-links mb-0">
                <li>
                  <router-link to="/en/zh/online-courses" style="color: #fd4f1c; font-weight: bold">
                    HSK Courses
                  </router-link>
                </li>
                <li>
                  <router-link to="/en/zh/tv-shows">
                    TV Shows
                  </router-link>
                </li>
                <li>
                  <router-link to="/en/zh/dictionary">
                    Video Dictionary
                  </router-link>
                </li>
                <li>
                  <router-link to="/en/zh/phrasebooks">
                    Phrasebooks
                  </router-link>
                </li>
                <li>
                  <router-link to="/en/zh/reader">Reader</router-link>
                </li>
                <li>
                  <router-link to="/en/zh/grammar">
                    Grammar
                  </router-link>
                </li>
                <li>
                  <router-link to="/en/zh/live-tv">
                    Live TV
                  </router-link>
                </li>
                <li>
                  <router-link to="/en/zh/resource/list/all/all">
                    Resources
                  </router-link>
                </li>
              </ul>
            </div>
          </div>
          <div class="col-sm-6 mb-5">
            <div class="home-card">
              <router-link to="/zh/en">
                <img src="/img/ezh-logo-dark.png" class="ezh-logo" data-not-lazy />
              </router-link>
              <hr />
              <ul class="ezh-links mb-0">
                <li>
                  <router-link to="/zh/en/online-courses" style="color: #1b3e76; font-weight: bold">
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
                  <router-link to="/zh/en/tv-shows">TV Shows 电视节目</router-link>
                </li>
                <li>
                  <router-link to="/zh/en/talks">Channels 油管频道</router-link>
                </li>
                <li>
                  <router-link to="/zh/en/audiobooks">Audiobooks 有声书</router-link>
                </li>
                <li>
                  <router-link to="/zh/en/live-tv">Live TV 电视直播</router-link>
                </li>
                <li>
                  <router-link to="/zh/en/reader">Reader 文字阅读器</router-link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <client-only>
          <div class="row mb-5">
            <div class="col-sm-12">
              <div class="home-card">
                <h5 class="text-center">More Languages</h5>
                <LanguageList :codes="[
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
                ]" class="mt-4" :sort="true" />
                <h5 class="text-center mt-5">EVEN More languages</h5>
                <Choose :compact="true" :showLanguageList="false" />
              </div>
            </div>
          </div>
        </client-only>

        <div class="row">
          <div class="col-sm-6 mb-5">
            <div class="home-card text-center">
              <h5 class="mb-3">Discover TV Shows Across Languages</h5>
              <router-link to="/discover-shows">
                <img src="/img/thumbnail-discover-shows.jpg" alt="Discover TV Shows Across Languages"
                  class="rounded shadow img-fluid" data-not-lazy />
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
        <div class="row mt-5 mb-5">
          <div class="col-sm-12">
            <div class="home-card home-card-dark">
              <LazyFooter />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Helper from '@/lib/helper'
export default {
  data() {
    return {
      loaded: false,
      hasDashboard: false,
      randomLanguage: undefined,
      languagesWithVideos: [
        ["Chinese", "zho"],
        ["English", "eng"],
        ["Korean", "kor"],
        ["German", "deu"],
        ["Italian", "ita"],
        ["Japanese", "jpn"],
        ["French", "fra"],
        ["Spanish", "spa"],
        ["Catalan", "cat"],
        ["Russian", "rus"],
        ["Vietnamese", "vie"],
        ["Turkish", "tur"],
        ["Yue Chinese", "yue"],
        ["Ukrainian", "ukr"],
        ["Dutch", "nld"],
        ["Arabic", "ara"],
        ["Norwegian", "nor"],
        ["Modern Greek", "ell"],
        ["Swedish", "swe"],
        ["Mandarin Chinese", "cmn"],
        ["Hindi", "hin"],
        ["Polish", "pol"],
        ["Min Nan Chinese", "nan"],
        ["Persian", "fas"],
        ["American Sign Language", "ase"],
        ["Indonesian", "ind"],
        ["Portuguese", "por"],
        ["Thai", "tha"],
        ["Hungarian", "hun"],
        ["Georgian", "kat"],
        ["Romanian", "ron"],
        ["Serbian", "srp"],
        ["Tagalog", "tgl"],
        ["Malay", "msa"],
        ["Wolof", "wol"],
        ["Tamil", "tam"],
        ["Esperanto", "epo"],
        ["Hebrew", "heb"],
        ["Slovak", "slk"],
        ["Croatian", "hrv"],
        ["Welsh", "cym"],
        ["Armenian", "hye"],
        ["Bengali", "ben"],
        ["Gujarati", "guj"],
        ["Bulgarian", "bul"],
        ["Danish", "dan"],
        ["Icelandic", "isl"],
        ["Marathi", "mar"],
        ["Czech", "ces"],
        ["Kazakh", "kaz"],
        ["Mongolian", "mon"],
        ["Latvian", "lav"],
        ["Klingon", "tlh"],
        ["Galician", "glg"],
        ["Estonian", "est"],
        ["Breton", "bre"],
        ["Lithuanian", "lit"],
        ["Latin", "lat"],
        ["Macedonian", "mkd"],
        ["Azerbaijani", "aze"],
        ["Finnish", "fin"],
        ["Sundanese", "sun"],
        ["Panjabi", "pan"],
        ["Montenegrin", "cnr"],
        ["Literary Chinese", "lzh"],
        ["Indian Sign Language", "ins"],
        ["Telugu", "tel"],
        ["Serbo-Croatian", "hbs"],
        ["Albanian", "sqi"],
        ["Urdu", "urd"],
        ["Belarusian", "bel"],
        ["Tibetan", "bod"],
        ["Irish", "gle"],
        ["Burmese", "mya"],
        ["Assamese", "asm"],
        ["Kannada", "kan"],
        ["Uzbek", "uzb"],
        ["Hakka Chinese", "hak"],
        ["Maori", "mri"],
        ["Maltese", "mlt"],
        ["Standard Arabic", "arb"],
        ["Malayalam", "mal"],
        ["Luxembourgish", "ltz"],
        ["Central Kurdish", "ckb"],
        ["Ancient Greek", "grc"],
        ["Scottish Gaelic", "gla"],
        ["Amis", "ami"],
        ["Lao", "lao"],
        ["Khmer", "khm"],
        ["Tatar", "tat"],
        ["Faroese", "fao"],
        ["Sanskrit", "san"],
        ["Quechua", "que"],
        ["Yoruba", "yor"],
        ["Norwegian Sign Language", "nsl"],
        ["Samoan", "smo"],
        ["Sinhala", "sin"],
        ["Somali", "som"],
        ["Javanese", "jav"],
        ["Kurdish", "kur"],
        ["Slovenian", "slv"],
        ["Bashkir", "bak"],
        ["Afrikaans", "afr"],
        ["Amharic", "amh"],
        ["Cebuano", "ceb"],
        ["Kirghiz", "kir"],
        ["French Sign Language", "fsl"],
        ["Basque", "eus"],
        ["Western Frisian", "fry"],
        ["Ancient Hebrew", "hbo"],
        ["Wu Chinese", "wuu"],
        ["Bosnian", "bos"],
        ["Occitan", "oci"],
        ["Sindhi", "snd"],
        ["Kachin", "kac"],
        ["Swahili", "swa"],
        ["Yiddish", "yid"],
        ["Nepali", "nep"],
        ["Old Norse", "non"],
        ["Tigrinya", "tir"],
        ["Oromo", "orm"],
        ["Dari", "prs"],
        ["Saramaccan", "srm"],
        ["Scots", "sco"],
        ["Swiss German", "gsw"],
        ["Crimean Tatar", "crh"],
        ["Metlatónoc Mixtec", "mxv"],
        ["Iranian Persian", "pes"],
        ["Romansh", "roh"],
        ["Malagasy", "mlg"],
        ["Bhojpuri", "bho"],
        ["Sicilian", "scn"],
        ["Hiligaynon", "hil"],
        ["Korean Sign Language", "kvk"],
        ["Navajo", "nav"],
        ["Coptic", "cop"],
        ["Gothic", "got"],
        ["Xiang Chinese", "hsn"],
        ["Interlingua", "ina"],
        ["Karelian", "krl"],
        ["Lingala", "lin"],
        ["Norwegian Bokmål", "nob"],
        ["Abkhazian", "abk"],
        ["Norwegian Nynorsk", "nno"],
        ["Central Okinawan", "ryu"],
        ["Xhosa", "xho"],
        ["Yakut", "sah"],
        ["Uighur", "uig"],
        ["Zhuang", "zha"],
        ["Zulu", "zul"],
        ["Ainu", "aib"],
        ["Pu-Xian Chinese", "cpx"],
        ["Guarani", "grn"],
        ["Hani", "hni"],
        ["Min Bei Chinese", "mnp"],
        ["Pushto", "pus"],
        ["Lower Silesian", "sli"],
        ["Tajik", "tgk"],
        ["Zuojiang Zhuang", "zzj"],
        ["Old English", "ang"],
        ["Kashubian", "csb"],
        ["Hausa", "hau"],
        ["Old Japanese", "ojp"],
        ["Northern Sami", "sme"],
        ["Ainu", "ain"],
        ["Jinyu Chinese", "cjy"],
        ["Kalaallisut", "kal"],
        ["Ladino", "lad"],
        ["Achuar-Shiwiar", "acu"],
        ["Official Aramaic", "arc"],
        ["Lower Sorbian", "dsb"],
        ["Dzongkha", "dzo"],
        ["Manx", "glv"],
        ["Sichuan Yi", "iii"],
        ["S'gaw Karen", "ksw"],
        ["Late Middle Chinese", "ltc"],
        ["Sumerian", "sux"],
        ["West Yugur", "ybe"],
        ["Akkadian", "akk"],
        ["A'ou", "aou"],
        ["Awadhi", "awa"],
        ["Aymara", "aym"],
        ["Friulian", "fur"],
        ["Chhattisgarhi", "hne"],
        ["Kabyle", "kab"],
        ["Kpelle", "kpe"],
        ["Maithili", "mai"],
        ["Maru", "mhx"],
        ["N'Ko", "nqo"],
        ["Saint Lucian Creole French", "acf"],
        ["Burushaski", "bsk"],
        ["Basay", "byq"],
        ["Min Zhong Chinese", "czo"],
        ["Gan Chinese", "gan"],
        ["Guinea Kpelle", "gkp"],
        ["Old High German", "goh"],
        ["Igbo", "ibo"],
        ["Inupiaq", "ipk"],
        ["Minangkabau", "min"],
        ["Manipuri", "mni"],
        ["Old Chinese", "och"],
        ["Oriya", "ori"],
        ["Pijin", "pis"],
        ["Piemontese", "pms"],
        ["Sardinian", "srd"],
        ["Swati", "ssw"],
        ["Venetian", "vec"],
        ["Volapük", "vol"],
        ["Liberia Kpelle", "xpe"],
        ["Zuojiang Zhuang", "zzj"],
        ["Egyptian Arabic", "arz"],
        ["Middle English", "enm"],
        ["Jamaican Creole English", "jam"],
        ["Konkani", "kok"],
        ["Lakota", "lkt"],
        ["Oscan", "osc"],
        ["Sindarin", "sjn"],
        ["Tsakonian", "tsd"]
      ]
    };
  },
  created() {
    this.randomLanguage = Helper.randomArrayItem(this.languagesWithVideos.slice(0, 141))
  },
  mounted() {
    this.loaded = true;
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