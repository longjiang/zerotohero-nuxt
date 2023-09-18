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
              name: 'explore-media',
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
export default {
  data() {
    return {
      l1: undefined, // Object
      l2: undefined, // Object
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
    l2Options() {
      let allLanguages = this.$languages.l1s.filter((language) =>
        this.$languages.commonLangs.includes(language.code)
      );
      let commonCodes = "zh en ja ko th fr de es pt it ru bn hi ins te ur ta ar fa yue hak nan lzh och wuu"
          .split(" ")
      let commonLanguages = commonCodes.map(code => {
          return allLanguages.find(language => language.code === code);
        }).filter(language => language !== undefined);
      let options = allLanguages
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((language) => {
          let flagEmoji = this.languageCountryFlagEmoji(language);
          return {
            value: language,
            text: (flagEmoji ? flagEmoji + " " : "") + language.name + ' - ' + language.vernacularName + ` (${ language.code })`,
          };
        })
      let commonOptions = commonLanguages.map((language) => {
        let flagEmoji = this.languageCountryFlagEmoji(language);
        return {
          value: language,
          text: (flagEmoji ? flagEmoji + " " : "") + this.$tb(language.name) + ` (${ language.code })`,
        };
      });
      return [
        ...commonOptions,
        { text: "------------------------" },
        { text: this.$tb("More Languages:") },
        ...options,
      ];
    },
    l1Options() {
      // Get the value of l2 from the component data
      let l2 = this.l2;

      // Filter the supported L1 languages based on whether they are included
      // in the commonLangs list and have a dictionary for the given L2 language
      let supportedL1s = this.$languages.supportedL1s(l2["iso639-3"])

      // Map the supported L1 languages to an array of objects with 'value' and 'text' properties
      let options = supportedL1s.map((language) => {
        let flagEmoji = this.languageCountryFlagEmoji(language);
        return {
          value: language,
          text: (flagEmoji ? flagEmoji + " " : "") + this.$tb(language.name) + ` (${this.$tb(language.code)})`,
        };
      });

      // If there's only one L1 option, automatically set l1 to that option
      if (options.length === 1) this.l1 = options[0].value;
      // If multiple L1 options are available, set l1 to browser's language
      else if (options.length > 1 && this.$browserLanguage) {
        let browserLanguage = this.$languages.getSmart(this.$browserLanguage);
        if (browserLanguage) this.l1 = browserLanguage;
      } else this.l1 = undefined;
      return options;
    },
  },
  methods: {
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
