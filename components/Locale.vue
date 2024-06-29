<template>
  <span v-if="locale">
    <img v-if="country" :alt="`Flag of ${country.name}`" :title="`Flag of ${country.name} (${country.alpha2Code})`"
      :src="`/vendor/flag-svgs/${country.alpha2Code}.svg`" class="flag-icon mr-1"
      style="width: 1rem; position: relative; bottom: 0.1rem" />
    {{ localeDescription || locale }}
  </span>
</template>

<script>
export default {
  props: {
    locale: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      country: null,
      localeDescription: ''
    };
  },
  async mounted() {
    await this.fetchLocaleDetails();
  },
  methods: {
    async fetchLocaleDetails() {
      // Simulate fetching data
      const { country, language, description } = await this.getLocaleDescription(this.locale);
      this.country = country;
      this.localeDescription = description;
    },
    async getLocaleDescription(locale) {
      // Example of extracting language code and country/script code
      let language, country, script;
      let [langCode, countryCodeOrScript] = locale.split("-");
      language = await this.fetchLanguage(langCode); // Implement fetchLanguage method
      if (countryCodeOrScript) {
        const scripts = [
          { code: 'Hans', name: 'Simplified' },
          { code: 'Hant', name: 'Traditional' },
          { code: 'Latn', name: 'Latin' },
          { code: 'Cyrl', name: 'Cyrillic' }
        ];
        script = scripts.find(s => s.code === countryCodeOrScript);
        if (!script) {
          country = await this.fetchCountry(countryCodeOrScript); // Implement fetchCountry method
        }
      }
      let description = `${language ? language.name : ''}`;
      if (country) description += ` (${country.name})`;
      if (script) description += ` (${script.name})`;
      return { country, language, description };
    },
    async fetchLanguage(langCode) {
      return await this.$languages.getSmart(langCode);
    },
    async fetchCountry(countryCode) {
      return await this.$languages.countryFromCode(countryCode);
    }
  }
}
</script>

<style scoped>
.flag-icon {
  width: 1rem;
  position: relative;
  bottom: 0.1rem;
}
</style>
