<template>
  <div class="look-up-in">
    <div class="text-secondary small">
      {{ $t('More info on:') }}
      <a
        :href="`https://www.zdic.net/hans/${term}`"
        target="_blank"
        class="link-unstyled"
        v-if="$l2.han"
      >
        {{ $t('汉典(ZDIC)') }}
      </a>
      <a
        :href="`https://dictionary.cambridge.org/dictionary/english-chinese-simplified/${term}`"
        class="link-unstyled"
        target="_blank"
        v-if="$l2.code === 'en'"
      >
        {{ $t('Cambridge Dictionary') }}
      </a>
      <a
        :href="`https://en.m.wiktionary.org/w/index.php?search=${term}#${$l2.name}`"
        class="link-unstyled"
        target="_blank"
      >
        {{ $t('Wiktionary') }}
      </a>
      <a
        :href="`https://www.etymonline.com/word/${term}`"
        v-if="$l2.code === 'en'"
        class="link-unstyled"
        target="_blank"
      >
        {{ $t('Etymology Dictionary') }}
      </a>
      <a
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
        class="link-unstyled"
        target="_blank"
      >
        {{ $t('Usage Trends') }}
      </a>
      <a
        :href="`https://www.moedict.tw/${traditional ? traditional : tify(term)}`"
        v-if="$l2.han"
        class="link-unstyled"
        target="_blank"
      >
        
        {{ $t('萌典(MOEDICT)') }}
      </a>
      <a
        :href="`https://baike.baidu.com/item/${term}`"
        v-if="$l2.han"
        class="link-unstyled"
        target="_blank"
      >
        
        {{ $t('百度百科(Baidu Baike)') }}
      </a>
      <a
        :href="`https://korean.dict.naver.com/${['zh', 'ko', 'ja'].includes($l1.code) ? $l1.code : 'en'}${$l2.code === 'ko' ? $l1.code : $l2.code}dict/#/search?query=${term}`"
        v-if="['zh', 'ko', 'ja'].includes($l2.code)"
        class="link-unstyled"
        target="_blank"
      >
        
        {{ $t('Naver Dictionary') }}
      </a>
      <a
        :href="`https://resources.allsetlearning.com/gramwiki/?search=${term}`"
        v-if="$l2.code === 'zh'"
        class="link-unstyled"
        target="_blank"
      >
        
        {{ $t('Grammar Wiki') }}
      </a>
      <a
        :href="`https://${$l1.code}.m.wikipedia.org/w/index.php?search=${term}`"
        class="link-unstyled"
        target="_blank"
      >
        
        {{ $t('Wikipedia') }}
      </a>
    </div>
  </div>
</template>

<script>
import { tify } from 'chinese-conv'
import { timeout } from '@/lib/utils'
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
    async toggleIframe(e) {
      let href = e.target.getAttribute('href')
      if (this.iframe === href) this.iframe = undefined
      else this.iframe = href
      await timeout(500)
      this.$refs.iframe?.scrollIntoView({ behavior: 'smooth' })
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
a {
  text-decoration: underline;
  margin-right: 0.25rem;
}
</style>