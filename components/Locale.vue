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
    await this.getLocaleDetails();
  },
  methods: {
    async getLocaleDetails() {
      const { country, language, description } = await this.$languages.getLocaleDescription(this.locale);
      this.country = country;
      this.localeDescription = description;
    },
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
