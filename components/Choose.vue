<template>
  <div>
    <div class="container mb-4" v-if="languages.length > 0">
      <div class="row">
        <div class="col-sm-12">
          <LanguageSwitch
            v-if="languages.length > 0"
            class="mt-3 mb-4"
            :preferredLanguages="languages"
          />
        </div>
      </div>
      <div class="row m-sm-1 p-3" style="background: url('/img/background-stars-2.jpg'); background-repeat: no-repeat; background-size: cover;">
        <div
          class="col-xl-3 col-lg-4 col-md-6 col-12"
          v-for="code in [
            'hbo',
            'ar',
            'yue',
            'zh',
            'fr',
            'de',
            'he',
            'it',
            'ko',
            'ja',
            'fa',
            'pt',
            'ru',
            'es',
            'en',
            'lzh',
          ]"
          :key="`lang-logo-${code}`"
        >
          <div class="mt-3 mb-3">
            <LanguageLogo
              :l1="language(['en', 'lzh'].includes(code) ? 'zh' : 'en')"
              :l2="language(code)"
              class="choose-lang-logo"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <ul v-if="languages && languages.length > 0" class="language-list">
            <li
              v-for="language in languages"
              :key="`lang-${language.code}`"
              class="language-list-item"
              :set="
                (base = `/${language.code !== 'en' ? 'en' : 'zh'}/${
                  language.code
                }`)
              "
            >
              <router-link
                :to="`${base}/youtube/browse/all/all/0`"
                :class="{
                  'feature-icon mr-1': true,
                  transparent: !hasYouTube(english, language),
                }"
              >
                <i class="fab fa-youtube" />
              </router-link>
              <router-link
                :to="`${base}/dictionary`"
                :class="{
                  'feature-icon mr-1': true,
                  transparent: !hasDictionary(english, language),
                }"
              >
                <i class="fas fa-book" />
              </router-link>
              <router-link :to="base">
                {{
                  language.code !== "en"
                    ? language.name.replace(/ \(.*\)/gi, "")
                    : "英语"
                }}
              </router-link>
            </li>
          </ul>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-12">
          <div class="mt-5">
            <p>
              <strong>This is an open-source project.</strong>
              This website is built on
              <code>Vue.js</code>
              and is fully open source. Check out the code on GitHub at
              <a href="https://github.com/longjiang/zerotohero-cli">
                https://github.com/longjiang/zerotohero-cli
              </a>
              .
            </p>
          </div>
          <div class="mt-5">
            <p class="mb-4">
              <strong>Credits:</strong>
              <span v-html="dictionaryCredit"></span>
              The collocations and example sentences are provided by
              <a target="_blank" href="https://www.sketchengine.eu/">
                SketchEngine
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LanguageLogo from "@/components/LanguageLogo";
import LanguageSwitch from "@/components/LanguageSwitch";

export default {
  components: {
    LanguageLogo,
    LanguageSwitch,
  },
  data() {
    return {
      languages: [],
      dictionaryCredit: "",
    };
  },
  methods: {
    language(code) {
      return this.$languages.l1s.find((language) => language.code === code);
    },
    hasDictionary(l1, l2) {
      return this.hasFeature(l1, l2, "dictionary") || l2.code === "en";
    },
    hasYouTube(l1, l2) {
      return this.$languages.hasYouTube(l1, l2);
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
  },
  computed: {
    english() {
      return this.$languages.l1s.find((language) => language.code === "en");
    },
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
  },
  async mounted() {
    let dictionary = await this.$getDictionary();
    if (dictionary) {
      this.dictionaryCredit = await dictionary.credit();
    }
    this.languages = this.$languages.l1s
      .filter(
        (language) => ["A", "C", "L", "E", "H"].includes(language.type) // Only living, extinct or historical languages (exclusing special codes 'S' and macro languages 'M')
      )
      .filter((language) => this.$languages.hasYouTube(this.english, language))
      .filter((language) => language.code !== "fil")
      // .filter((language) =>
      //   this.hasFeature(this.english, language, "dictionary")
      // )
      .sort((a, b) => {
        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }
        return 0;
      });
  },
};
</script>

<style scoped>
.transparent {
  opacity: 0;
}

.logo-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.logo-grid > * {
  width: 13rem;
}

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
