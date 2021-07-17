<template>
  <ul v-if="languages && languages.length > 0" class="language-list">
    <li
      v-for="language in languages"
      :key="`lang-${language.code}`"
      class="language-list-item"
      :set="(base = languagePath(language))"
    >
      <router-link
        :to="`${base}youtube/browse/all/all/0`"
        :class="{
          'feature-icon mr-1': true,
          transparent: !hasYouTube(english, language),
        }"
      >
        <i class="fab fa-youtube" />
      </router-link>
      <router-link
        :to="`${base}dictionary`"
        :class="{
          'feature-icon mr-1': true,
          transparent: !hasDictionary(english, language),
        }"
      >
        <i class="fas fa-book" />
      </router-link>
      <router-link :to="base">
        {{ languageName(language) }}
      </router-link>
    </li>
  </ul>
</template>

<script>
import Helper from "@/lib/helper";
export default {
  props: {
    langs: {
      default: undefined,
    },
    codes: {
      default: undefined,
    },
    sort: {
      default: false,
    },
  },
  data() {
    return {
      specials: {
        en: {
          name: "英语",
          l1: "zh",
        },
        lzh: {
          name: "文言文",
          l1: "zh",
        },
        cmn: {
          name: "Mandarin (Pinyin)",
          l1: "en",
        },
      },
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
    english() {
      return this.$languages.l1s.find((language) => language.code === "en");
    },
    languages() {
      let languages = this.langs
      if (!languages && this.codes) {
        languages = this.codes.map((c) => this.$languages.getSmart(c));
      }
      if (this.sort) {
        languages = Helper.uniqueByValue(languages, "iso639-3").sort(
          (a, b) => this.languageName(a).localeCompare(this.languageName(b), "en")
        );
      }
      return languages
    },
  },
  methods: {
    languagePath(language) {
      let l1 = 'en'
      let special = this.specials[language.code]
      if (special) l1 = special.l1
      return `/${l1}/${language.code}/`;
    },
    languageName(language) {
      let name = language.name.replace(/ \(.*\)/gi, "")
      let special = this.specials[language.code]
      if (special) name = special.name
      return name
    },
    hasFeature(l1, l2, feature) {
      return this.$languages
        .getFeatures(
          {
            l1,
            l2,
          },
          process.browser
        )
        .includes(feature);
    },
    hasDictionary(l1, l2) {
      return this.hasFeature(l1, l2, "dictionary") || l2.code === "en";
    },
    hasYouTube(l1, l2) {
      return this.$languages.hasYouTube(l1, l2);
    },
  },
};
</script>

<style scoped>
.language-list {
  color: #666;
  list-style: none;
  padding: 0;
  column-gap: 2rem;
}

@media (min-width: 576px) {
  .language-list {
    column-count: 1;
  }
}

@media (min-width: 768px) {
  .language-list {
    column-count: 2;
  }
}

@media (min-width: 992px) {
  .language-list {
    column-count: 3;
  }
}

@media (min-width: 1200px) {
  .language-list {
    column-count: 4;
  }
}

.language-list-item a {
  color: #666;
}
.language-list-item .feature-icon {
  color: #ccc;
}

.bg-dark .language-list-item a {
  color: #b9aba6;
}
.bg-dark .language-list-item .feature-icon {
  color: #726661;
}
</style>