<template>
  <div>
    <Search
      placeholder="Search by language name or code..."
      :hrefFunc="hrefFunc"
      :button="true"
      :suggestionsFunc="suggestionsFunc"
      type="generic"
      :defaultURL="(text) => `/en/${text}/`"
      :random="random ? random : false"
      ref="l1"
    />
  </div>
</template>

<script>
import Search from "@/components/Search";
import Helper from "@/lib/helper";

export default {
  components: {
    Search,
  },
  props: {
    preferredLanguages: {
      type: Array,
    },
  },
  data() {
    return {
      languages: [],
      enLanguages: [],
      random: undefined
    };
  },
  mounted() {
    this.languages = this.$languages.l1s
      .filter(
        (language) => ["A", "C", "L", "E", "H"].includes(language.type) // Only living, extinct or historical languages (exclusing special codes 'S' and macro languages 'M')
      )
      .sort((a, b) => {
        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }
        return 0;
      });
    this.enLanguages = this.languages.filter(
      (language) => !["E", "H"].includes(language.type)
    );
    this.random = this.getRandom()
  },
  watch: {
    '$route.params.l2'() {
      this.random = this.getRandom()
    }
  },
  methods: {
    getRandom() {
      if (this.preferredLanguages) {
        let preferredLanguages = this.preferredLanguages;
        if (this.$l2)
          preferredLanguages = preferredLanguages.filter(
            (lang) => lang.code !== this.$l2.code
          );
        let randomLanguage = Helper.randomArrayItem(preferredLanguages);
        return `/${randomLanguage.code === "en" ? "zh" : "en"}/${
          randomLanguage.code
        }`;
      }
    },
    suggestionsFunc(text) {
      text = text.toLowerCase();
      let english = this.languages.find((language) => language.code === "en");
      return this.languages
        .filter(
          (language) =>
            language.code.includes(text) ||
            language["iso639-3"].includes(text) ||
            language.name.toLowerCase().includes(text)
        )
        .sort((a, b) => b.name.length - a.name.length)
        .sort((language) =>
          language["iso639-3"].startsWith(text) ||
          language.name.startsWith(text)
            ? 1
            : -1
        )
        .map((language) => {
          return {
            head: `${language.name} (${
              language.code !== language["iso639-3"] ? language.code + ", " : ""
            }${language["iso639-3"]})`,
            definitions: this.$languages.getFeatures({
              l1: english,
              l2: language,
            }),
            l1: english,
            l2: language,
          };
        })
        .slice(0, 30);
    },
    hrefFunc(suggestion) {
      if (suggestion && suggestion.l1 && suggestion.l2) {
        return `/${suggestion.l1.code}/${suggestion.l2.code}/`;
      }
    },
  },
};
</script>

<style>
</style>