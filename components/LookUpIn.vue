<template>
  <div class="look-up-in">
    <div class="text-secondary">
      {{ $t("Look up in:") }}
      <a
        v-for="(source, index) in sources.filter(s => s.available)"
        :href="source.url"
        class="lookup-link mr-2"
        target="_blank"
        :key="`external-${index}`"
      >
        {{ $t(source.title) }}
        <i class="fas fa-angle-right"></i>
      </a>
    </div>
  </div>
</template>

<script>
import { tify } from "chinese-conv";
import { timeout } from "@/lib/utils";
export default {
  props: {
    term: "",
    traditional: "",
    level: "",
    sticky: {
      default: true,
    },
  },
  data() {
    return {
      extDict: "",
      iframe: "",
      sources: [],
    };
  },
  computed: {
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
  },
  mounted() {
    let sources = [
      {
        title: 'Youdao',
        available: this.$l2.code === 'en' && this.$l1.code === 'zh',
        url: `http://dict.youdao.com/w/${this.term}`
      },
      {
        title: 'Youdao',
        available: this.$l2.code === 'ja' && this.$l1.code === 'zh',
        url: `http://dict.youdao.com/w/jap/${this.term}`
      },
      {
        title: 'Youdao',
        available: this.$l2.code === 'fr' && this.$l1.code === 'zh',
        url: `http://dict.youdao.com/w/fr/${this.term}`
      },
      {
        title: 'Youdao',
        available: this.$l2.code === 'ko' && this.$l1.code === 'zh',
        url: `http://dict.youdao.com/w/ko/${this.term}`
      },
      {
        title: 'Weblio',
        available: this.$l2.code === 'ja',
        url: `https://ejje.weblio.jp/content/${this.term}`
      },
      {
        title: 'Jisho',
        available: this.$l2.code === 'ja',
        url: `https://jisho.org/search/${this.term}`
      },
      {
        title: 'JapanDict',
        available: this.$l2.code === 'ja',
        url: `https://www.japandict.com/?s=${this.term}&lang=eng`
      },
      {
        title: 'Tangorin',
        available: this.$l2.code === 'ja',
        url: `https://tangorin.com/words?search=${this.term}&lang=eng`
      },
      {
        title: "汉典(ZDIC)",
        available: this.$l2.han,
        url: `https://www.zdic.net/hans/${this.term}`,
      },
      {
        title: "Cambridge Dictionary",
        available: this.$l2.code === "en",
        url: `https://dictionary.cambridge.org/dictionary/english-chinese-simplified/${this.term}`,
      },
      {
        title: "Wiktionary",
        available: true,
        url: `https://en.m.wiktionary.org/w/index.php?search=${this.term}#${this.$l2.name}`,
      },
      {
        title: "Usage Trends",
        available: ['en', 'zh', 'fr', 'de', 'he', 'it', 'ru', 'es'].includes(this.$l2.code),
        url: `https://books.google.com/ngrams/graph?content=${
          this.term
        }&year_start=${
          this.$l2.code === "zh" ? 1900 : 1800
        }&year_end=2019&corpus=${
          {
            en: 26,
            zh: 34,
            fr: 30,
            de: 31,
            he: 35,
            it: 33,
            ru: 36,
            es: 32,
          }[this.$l2.code]
        }&smoothing=3`,
      },
      {
        title: "Etymology Dictionary",
        available: this.$l2.code === "en",
        url: `https://www.etymonline.com/word/${this.term}`,
      },
      {
        title: "萌典(MOEDICT)",
        available: this.$l2.han,
        url: `https://www.moedict.tw/${
          this.traditional ? this.traditional : tify(this.term)
        }`,
      },
      {
        title: "百度百科(Baidu Baike)",
        available: this.$l2.han,
        url: `https://baike.baidu.com/item/${this.term}`,
      },
      {
        title: "Naver Ko-Ko",
        available: this.$l2.code === "ko",
        url: `https://ko.dict.naver.com/#/search?query=${this.term}`,
      },
      {
        title: "Naver Hanja",
        available: this.$l2.code === "ko",
        url: `https://hanja.dict.naver.com/#/search?query=${this.term}&range=all`,
      },
      {
        title: "Naver En-En",
        available: this.$l2.code === "en",
        url: `https://english.dict.naver.com/english-dictionary/#/search?query=${this.term}`,
      },
      {
        title: "Naver Ko-En",
        available: this.$l2.code === "ko" && this.$l1.code === "en",
        url: `https://korean.dict.naver.com/koendict/dict/#/search?query=${this.term}`,
      },
      {
        title: "Naver En-Ko",
        available: this.$l2.code === "en" && this.$l1.code === "ko",
        url: `https://en.dict.naver.com/#/search?query=${this.term}&range=all`,
      },
      {
        title: "Naver Ja/Ko",
        available: (this.$l2.code === "ja" && this.$l1.code === "ko") || (this.$l2.code === "ja" && this.$l1.code === "ko"),
        url: `https://ja.dict.naver.com/#/search?query=${this.term}&range=all`,
      },
      {
        title: "Naver Ko/Zh",
        available: (this.$l2.han && this.$l1.code === "ko") || (this.$l2.code === "ko" && this.$l1.han),
        url: `https://zh.dict.naver.com/#/search?query=${this.term}`,
      },
      {
        title: "Naver Es/Ko Dictionary",
        available: (this.$l2.code === "es" && this.$l1.code === "ko") || (this.$l2.code === "ko" && this.$l1.code === "es"),
        url: `https://dict.naver.com/eskodict/#/search?query==${this.term}`,
      },
      {
        title: "Naver De/Ko Dictionary",
        available: (this.$l2.code === "de" && this.$l1.code === "ko") || (this.$l2.code === "ko" && this.$l1.code === "de"),
        url: `https://dict.naver.com/dekodict/#/search?query==${this.term}`,
      },
      {
        title: "Grammar Wiki",
        available: this.$l2.code === "zh",
        url: `https://resources.allsetlearning.com/gramwiki/?search=${this.term}`,
      },
      {
        title: "Wikipedia",
        available: true,
        url: `https://${this.$l1.code}.m.wikipedia.org/w/index.php?search=${this.term}`,
      },
      {
        title: "Google",
        available: true,
        url: `https://www.google.com/search?q=${this.term}`,
      },
      {
        title: "Images",
        available: true,
        url: `https://www.google.com/search?q=${this.term}&tbm=isch`,
      },
    ];

    for (let l2 in 'fr es de vi ne lo my sw ar ur uz id km tl th tet fa ha he hbo hi el grc nl no da la ru ro sv sq uk it ka cs hr tr pt pl fi hu'.split(' ')) {
      sources.push({
        title: `Naver ${l2.toUpperCase()}/KO Dictionary`,
        available: (this.$l2.code === l2 && this.$l1.code === "ko") || (this.$l2.code === "ko" && this.$l1.code === l2),
        url: `https://dict.naver.com/${l2}kodict/#/search?query==${this.term}`,
      })
    }
    let naverEnDicts = {
     ru: 'russian',
     vi: 'vietnamese',
     es: 'spanish',
     id: 'indonesian',
     ja: 'japanese',
     zh: 'chinese',
     pt: 'portuguese'
    }
    for (let l2 in naverEnDicts) {
      sources.push({
        title: `Naver ${l2.toUpperCase()}/EN Dictionary`,
        available: (this.$l2.code === l2 && this.$l1.code === "en") || (this.$l2.code === "en" && this.$l1.code === l2),
        url: `https://english.dict.naver.com/english-${naverEnDicts[l2]}-dictionary/#/search?query=${this.term}`,
      })
    }
    this.sources = sources
  },
  methods: {
    async toggleIframe(e) {
      let href = e.target.getAttribute("href");
      if (this.iframe === href) this.iframe = undefined;
      else this.iframe = href;
      await timeout(500);
      this.$refs.iframe?.scrollIntoView({ behavior: "smooth" });
    },
    tify(string) {
      return tify(string);
    },
    setExtDict(dict) {
      if (this.extDict === dict) {
        this.extDict = "";
      } else {
        this.extDict = dict;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.lookup-link {
  white-space: nowrap;
  display: inline-block;
  color: #28a745;
}
</style>