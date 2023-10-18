<template>
  <div class="triage">
    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <div class="mb-2">
            {{ $tb("Which language would you like to learn?") }}
          </div>
          <b-form-select :options="l2Options" v-model="l2"></b-form-select>
        </div>
      </div>
      <div class="row mt-3" v-if="l2">
        <div class="col-sm-12">
          <div class="mb-2">
            {{ $tb("What is your mother tongue (first/native language)?") }}
          </div>
          <b-form-select :options="l1Options" v-model="l1"></b-form-select>
        </div>
      </div>
      <div class="row mt-4" v-if="l1 && l2">
        <div class="col-sm-12 text-center">
          <router-link
            class="btn btn-success pl-5 pr-5"
            :to="{
              name: 'recommended-video',
              params: { l1: l1.code, l2: l2.code === 'cmn' ? 'zh' : l2.code },
            }"
          >
            {{ $tb("Start Learning") }}
            <i class="fa-solid fa-chevron-right"></i>
          </router-link>
        </div>
      </div>
      <div class="mt-3 text-right">
        <router-link to="/language-map">
          <i class="fa-solid fa-earth-asia mr-2"></i>
          {{ $tb("See more languages on a map") }}
          <i class="fa-solid fa-chevron-right ml-2"></i>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { country } from "@/lib/utils/countries";
import { LANGS_WITH_CONTENT } from '@/lib/utils';

export default {
  data() {
    return {
      l1: undefined, // Object
      l2: undefined, // Object
      popularCodes:
        "en zh ko it es fr de ja pt ru".split(
          " "
        ),
      bannedCodes: "arb cmn nn nb prs".split(" "), // These languages are equivalent to their parent language (e.g. cmn is equivalent to zh)
    };
  },
  mounted() {},
  computed: {
    langsWithEnDict() {
      if (this.$languages) {
        let langsWithEnDict = this.$languages.l1s.filter(
          (l) => l.dictionaries && l.dictionaries.eng
        );
        return langsWithEnDict;
      }
    },
    allLanguages() {
      return this.$languages.l1s.filter((language) => {
        if (this.bannedCodes.includes(language.code)) return false;
        if (!LANGS_WITH_CONTENT.includes(language.code)) return false;
        return this.$languages.commonLangs.includes(language.code);
      });
    },
    popularLanguages() {
      let popularLanguages = this.popularCodes
        .map((code) => {
          return this.allLanguages.find((language) => language.code === code);
        })
        .filter((language) => language !== undefined);
      return popularLanguages || [];
    },
    l2Options() {
      let allLanguages = this.allLanguages;
      let popularOptions = this.popularLanguages
        .map(this.languageOption)
        .sort((a, b) => a.code - b.code)
      let allOptions = allLanguages
        .map(this.languageOption)
        .sort((a, b) => a.code - b.code)
      
      if (this.$l2) this.l2 = this.$l2
      return [
        ...popularOptions,
        { text: "------------------------" },
        { text: this.$tb("More Languages:") },
        ...allOptions,
      ];
    },
    l1Options() {
      // Get the value of l2 from the component data
      let l2 = this.l2;

      // Filter the supported L1 languages based on whether they are included
      // in the commonLangs list and have a dictionary for the given L2 language
      let supportedL1s = this.$languages.supportedL1s(l2["iso639-3"], this.$browserLanguage); // Already sorted by popularity and browser language
      let popularL1s = supportedL1s.slice(0, 10);

      // Map the supported L1 languages to an array of objects with 'value' and 'text' properties

      let popularOptions = popularL1s.map(this.languageOption).sort((a, b) => a.code - b.code)
      let allOptions = supportedL1s.map(this.languageOption).sort((a, b) => a.code - b.code)

      if (popularOptions.length) this.l1 = popularOptions[0].value;

      return [
        ...popularOptions,
        { text: "------------------------" },
        { text: this.$tb("More Languages:") },
        ...allOptions,
      ];
    },
  },
  methods: {
    languageOption(language) {
      let flagEmoji = this.languageCountryFlagEmoji(language);
      return {
        value: language,
        text: `${this.$tb(language.name)} (${language.code}) ${flagEmoji}`,
      };
    },
    languageCountryFlagEmoji(language) {
      let typicalCountryCode = this.$languages.countryCode(language);
      let typicalCountry = country(typicalCountryCode);
      if (typicalCountry) return typicalCountry.emoji;
      else return "";
    },
  },
};
</script>

<style></style>
