<template>
  <div>
    <div :class="{'ext-dictionary-buttons': true, 'bg-white sticky': sticky}">
      <a
        @click.prevent="toggleIframe"
        :href="`https://www.zdic.net/hans/${term}`"
        v-if="$l2.han"
        class="btn btn-small mb-1"
        :data-bg-level="iframe && iframe.startsWith('https://www.zdic.net') ? level : false"
      >
        汉典
      </a>
      <a
        @click.prevent="toggleIframe"
        :href="`https://dictionary.cambridge.org/dictionary/english-chinese-simplified/${term}`"
        v-if="$l2.code === 'en'"
        class="btn btn-small mb-1"
        :data-bg-level="iframe && iframe.startsWith('https://dictionary.cambridge.org') ? level : false"
      >
        Cambridge
      </a>
      <a
        @click.prevent="toggleIframe"
        :href="`https://en.m.wiktionary.org/w/index.php?search=${term}`"
        class="btn btn-small mb-1"
        :data-bg-level="iframe && iframe.startsWith('https://en.m.wiktionary.org') ? level : false"
      >
        Wiktionary
      </a>
      <a
        @click.prevent="toggleIframe"
        :href="`https://www.etymonline.com/word/${term}`"
        v-if="$l2.code === 'en'"
        class="btn btn-small mb-1"
        :data-bg-level="iframe && iframe.startsWith('https://www.etymonline.com') ? level : false"
      >
        Etymology
      </a>
      <a
        @click.prevent="toggleIframe"
        :href="`https://books.google.com/ngrams/graph?content=${
          term
        }&year_start=${$l2.code === 'zh' ? 1900 : 1800}&year_end=2019&corpus=${
          {
            en: 26,
            zh: 34,
            fr: 30,
            de: 31,
            he: 35,
            it: 33,
            ru: 36,
            es: 32,
          }[$l2.code]
        }&smoothing=3`"
        v-if="
          ['en', 'zh', 'fr', 'de', 'he', 'it', 'ru', 'es'].includes($l2.code)
        "
        class="btn btn-small mb-1"
        :data-bg-level="iframe && iframe.startsWith('https://books.google.com/ngrams') ? level : false"
      >
        Ngram
      </a>
      <a
        @click.prevent="toggleIframe"
        :href="`https://www.moedict.tw/${traditional ? traditional : tify(term)}`"
        v-if="$l2.han"
        class="btn btn-small mb-1"
        :data-bg-level="iframe && iframe.startsWith('https://www.moedict.tw') ? level : false"
      >
        萌典
      </a>
      <a
        @click.prevent="toggleIframe"
        :href="`https://baike.baidu.com/item/${term}`"
        v-if="$l2.han"
        class="btn btn-small mb-1"
        :data-bg-level="iframe && iframe.startsWith('https://baike.baidu.com') ? level : false"
      >
        百度百科
      </a>
      <a
        @click.prevent="toggleIframe"
        :href="`https://korean.dict.naver.com/ko${$l2.code === 'ko' ? $l1.code : $l2.code}dict/#/search?query=${term}`"
        v-if="['zh', 'ko', 'ja'].includes($l2.code)"
        class="btn btn-small mb-1"
        :data-bg-level="iframe && iframe.startsWith('https://korean.dict.naver.com/ko') ? level : false"
      >
        Naver
      </a>
      <a
        @click.prevent="toggleIframe"
        :href="`https://resources.allsetlearning.com/gramwiki/?search=${term}`"
        class="btn btn-small mb-1"
        v-if="$l2.code === 'zh'"
        :data-bg-level="iframe && iframe.startsWith('https://resources.allsetlearning.com') ? level : false"
      >
        Grammar Wiki
      </a>
      <a
        @click.prevent="toggleIframe"
        :href="`https://${$l2.code}.m.wikipedia.org/w/index.php?search=${term}`"
        class="btn btn-small mb-1"
        :data-bg-level="iframe && iframe.startsWith(`https://${$l2.code}.m.wikipedia.org`) ? level : false"
      >
        Wikipedia
      </a>
    </div>
    <div>
      <iframe
        v-if="iframe"
        :src="iframe"
        class="ext-dictinoary-iframe"
        data-not-lazy
      ></iframe>
    </div>
  </div>
</template>

<script>
import { tify } from 'chinese-conv'
export default {
  props: {
    term: '',
    traditional: '',
    level: '',
    sticky: {
      default: true
    }
  },
  data() {
    return {
      extDict: "",
      iframe: "",
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
  methods: {
    toggleIframe(e) {
      let href = e.target.getAttribute('href')
      if (this.iframe === href) this.iframe = undefined
      else this.iframe = href
    },
    tify(string) {
      return tify(string)
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
.ext-dictionary-buttons.sticky {
  display: block;
  position: sticky;
  top: 0;
  z-index: 1;
}
.ext-dictinoary-iframe {
  width: 100%;
  border: 1px solid #eee;
  height: calc(100vh - 4rem);
  border-radius: 0.5rem;
  background: #eee;
}
</style>