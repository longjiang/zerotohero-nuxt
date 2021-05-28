<template>
  <div>
    <div class="ext-dictionary-buttons p-2 bg-white">
      <b-button
        @click="setExtDict('zdic')"
        v-if="['zh', 'yue', 'nan', 'wuu', 'hak'].includes($l2.code)"
        class="btn btn-small"
        :data-bg-level="extDict === 'zdic' ? level : false"
      >
        汉典
      </b-button>
      <b-button
        @click="setExtDict('wiktionary')"
        class="btn btn-small"
        :data-bg-level="extDict === 'wiktionary' ? level : false"
      >
        Wiktionary
      </b-button>
      <b-button
        @click="setExtDict('etymology')"
        v-if="$l2.code === 'en'"
        class="btn btn-small"
        :data-bg-level="extDict === 'etymology' ? level : false"
      >
        Etymology
      </b-button>
      <b-button
        @click="setExtDict('ngram')"
        v-if="
          ['en', 'zh', 'fr', 'de', 'he', 'it', 'ru', 'es'].includes($l2.code)
        "
        class="btn btn-small"
        :data-bg-level="extDict === 'ngram' ? level : false"
      >
        Ngram
      </b-button>
      <b-button
        @click="setExtDict('cambridge')"
        v-if="$l2.code === 'en'"
        class="btn btn-small"
        :data-bg-level="extDict === 'cambridge' ? level : false"
      >
        Cambridge
      </b-button>
      <b-button
        @click="setExtDict('moedict')"
        v-if="['zh', 'yue', 'nan', 'wuu', 'hak'].includes($l2.code)"
        class="btn btn-small"
        :data-bg-level="extDict === 'moedict' ? level : false"
      >
        萌典
      </b-button>
      <b-button
        @click="setExtDict('baidu-baike')"
        v-if="$l2.code === 'zh'"
        class="btn btn-small"
        :data-bg-level="extDict === 'baidu-baike' ? level : false"
      >
        百度百科
      </b-button>
      <b-button
        @click="setExtDict('naver')"
        v-if="['zh', 'ko', 'ja'].includes($l2.code)"
        class="btn btn-small"
        :data-bg-level="extDict === 'naver' ? level : false"
      >
        Naver
      </b-button>
      <b-button
        @click="setExtDict('grammar-wiki')"
        class="btn btn-small"
        v-if="$l2.code === 'zh'"
        :data-bg-level="extDict === 'grammar-wiki' ? level : false"
      >
        Grammar Wiki
      </b-button>
    </div>
    <div class="mb-4 pl-2 pr-2">
      <iframe
        v-if="extDict === 'ngram'"
        :src="`https://books.google.com/ngrams/graph?content=${
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
        class="ext-dictinoary-iframe"
        data-not-lazy
      ></iframe>
      <iframe
        v-if="extDict === 'zdic'"
        :src="`https://www.zdic.net/hans/${term}`"
        class="ext-dictinoary-iframe"
        data-not-lazy
      ></iframe>
      <iframe
        v-if="extDict === 'wiktionary'"
        :src="`https://en.wiktionary.org/wiki/${term}`"
        class="ext-dictinoary-iframe"
        data-not-lazy
      ></iframe>
      <iframe
        v-if="extDict === 'etymology'"
        :src="`https://www.etymonline.com/word/${term}`"
        class="ext-dictinoary-iframe"
        data-not-lazy
      ></iframe>
      <iframe
        v-if="extDict === 'cambridge'"
        :src="`https://dictionary.cambridge.org/dictionary/english-chinese-simplified/${term}`"
        class="ext-dictinoary-iframe"
        data-not-lazy
      ></iframe>
      <iframe
        v-if="extDict === 'moedict'"
        :src="`https://www.moedict.tw/${traditional ? traditional : tify(term)}`"
        class="ext-dictinoary-iframe"
        data-not-lazy
      ></iframe>
      <iframe
        v-if="extDict === 'baidu-baike'"
        :src="`https://baike.baidu.com/item/${term}`"
        class="ext-dictinoary-iframe"
        data-not-lazy
      ></iframe>
      <iframe
        v-if="extDict === 'naver'"
        :src="`https://korean.dict.naver.com/ko${$l2.code}dict/chinese/#/search?query=${term}`"
        class="ext-dictinoary-iframe"
        data-not-lazy
      ></iframe>
      <iframe
        v-if="extDict === 'grammar-wiki'"
        :src="`https://resources.allsetlearning.com/gramwiki/?search=${term}`"
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
    level: ''
  },
  data() {
    return {
      extDict: "",
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
.ext-dictionary-buttons {
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