<template>
  <div>
    <Search
      :hrefFunc="hrefFunc"
      :button="button"
      :suggestionsFunc="suggestionsFunc"
      :nav="nav"
      :defaultURL="(text) => `/en/${text}`"
      :random="showRandom && random ? random : false"
      @nav="onNav"
      :placeholder="placeholder"
      ref="l1"
      type="generic"
    />
  </div>
</template>

<script>
import { uniqueByValue, randomArrayItem } from "@/lib/utils";
import Search from "@/components/Search";

export default {
  components: {
    Search,
  },
  props: {
    preferredLanguages: {
      type: Array,
    },
    placeholder: {
      type: String,
      default: "Search languages",
    },
    nav: {
      default: true,
    },
    langs: {
      type: Array,
    },
    showRandom: {
      default: true,
    },
    button: {
      default: true,
    },
  },
  data() {
    return {
      languages: [],
      enLanguages: [],
      random: undefined,
      featureList: {
        'youtube': 'YouTube',
        'dictionary': 'Dictionary',
        'omniglot': 'Omniglot',
        'transliteration': 'Transliteration',
        'live-tv': 'Live TV',
      }
    };
  },
  mounted() {
    if (this.langs) {
      this.languages = this.langs;
    } else {
      this.languages = this.$languages.l1s
        .filter((language) => {
          if (language.han) return true;
          if (["A", "C", "L", "E", "H"].includes(language.type)) return true; // living, extinct or historical languages (exclusing special codes 'S' and macro languages 'M')
        })
        .sort((a, b) => {
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        });
    }
    this.enLanguages = this.languages.filter(
      (language) => !["E", "H"].includes(language.type)
    );
    this.random = this.getRandom();
  },
  watch: {
    "$route.params.l2"() {
      this.random = this.getRandom();
    },
  },
  methods: {
    onNav(url, suggestion = undefined) {
      this.$emit("nav", url, suggestion);
      this.random = this.getRandom();
    },
    getRandom() {
      if (this.showRandom && this.languages) {
        let preferredLanguages = this.preferredLanguages || this.languages;
        if (this.$l2)
          preferredLanguages = preferredLanguages.filter(
            (lang) => lang.code !== this.$l2.code
          );
        let randomLanguage = randomArrayItem(preferredLanguages);
        return `/${randomLanguage.code === "en" ? "zh" : "en"}/${
          randomLanguage.code
        }/language-info`;
      }
    },
    suggestionsFunc(text) {
      text = text.toLowerCase();
      let english = this.languages.find((language) => language.code === "en");
      let filteredLanguages = [];
      let twoLetterCodeMatch = this.languages
        .filter((language) => language["iso639-1"].includes(text))
        .sort((language) => (language["iso639-1"].startsWith(text) ? 1 : -1));
      let threeLetterCodeMatch = this.languages
        .filter((language) => language["iso639-3"].includes(text))
        .sort((language) => (language["iso639-3"].startsWith(text) ? 1 : -1));
      let nameMatch = this.languages
        .filter((language) => language.name.toLowerCase().includes(text))
        .sort((a, b) => a.name.length - b.name.length);
      filteredLanguages = filteredLanguages.concat(
        twoLetterCodeMatch,
        threeLetterCodeMatch,
        nameMatch
      );
      if (filteredLanguages.length === 0) {
        let otherNamesMatch = this.languages.filter((language) =>
          (language.otherNames || []).join(" ").toLowerCase().includes(text)
        );
        filteredLanguages = filteredLanguages.concat(otherNamesMatch);
      }
      filteredLanguages = uniqueByValue(filteredLanguages, "id");
      filteredLanguages = filteredLanguages
        .map((language) => {
          let codes = [
            language["iso639-1"],
            language["iso639-3"],
            language["glottologId"],
          ].filter((c) => c);
          let features = this.$languages.getFeatures({
            l1: english,
            l2: language,
          });
          if (
            features.includes("dictionary") &&
            language.wiktionary &&
            english.dictionaries[language["iso639-3"]] &&
            english.dictionaries[language["iso639-3"]][0] === "wiktionary"
          ) {
            let dfi = features.findIndex((f) => f === "dictionary");
            features[dfi] = `${language.wiktionary} dictionary words`;
          }
          return {language, features, english, codes};
        })
        .slice(0, 30)
        .map(({language, features, english, codes}) => {
          return {
            head: `${this.$tb(language.name)} (${(language.otherNames || [])
              .concat(codes)
              .join(", ")})`,
            definitions: features.map(feature => this.$tb(this.featureList[feature] || feature)),
            l1: english,
            l2: language,
          };
        });
      return filteredLanguages;
    },
    hrefFunc(suggestion) {
      if (suggestion && suggestion.l1 && suggestion.l2) {
        return `/${suggestion.l1.code}/${suggestion.l2.code}/language-info`;
      }
    },
  },
};
</script>

<style></style>
