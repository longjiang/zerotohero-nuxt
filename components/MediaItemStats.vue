<template>
  <div class="statistics">

    <span class="statistics-item" v-if="item.avg_views || item.views">
      <i class="fa-solid fa-eye"></i>
      {{ formatK(item.avg_views || item.views) }}
    </span>
    <span v-if="item.avg_likes || item.likes">
      <i class="fa-solid fa-thumbs-up"></i>
      {{ formatK(item.avg_likes || item.likes) }}
    </span>
    <span v-if="item.avg_comments || item.comments">
      <i class="fa-solid fa-comment"></i>
      {{ formatK(item.avg_comments || item.comments) }}
    </span>
    <span class="statistics-item" v-if="item.locale">
      <img v-if="country" :alt="`Flag of ${country.name}`" :title="`Flag of ${country.name} (${country.alpha2Code})`"
        :src="`/vendor/flag-svgs/${country.alpha2Code}.svg`" class="flag-icon mr-1"
        style="width: 1rem; position: relative; bottom: 0.1rem" />
      {{ localeDescription }}
    </span>
    <span class="statistics-item" v-if="item.category">
      {{ $t(categories[item.category]) }}
    </span>
    <span
      class="statistics-item"
      v-if="
        (showDate || $adminMode) &&
        item.date &&
        !isNaN(Date.parse(item.date))
      "
    >
      {{ $d(new Date(item.date), "short", $l1.code) }}
    </span>
  </div>
</template>
<script>
import { mapState } from "vuex";
import { formatK } from "@/lib/utils";

export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
    showDate: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      localeDescription: undefined,
      country: undefined,
      language: undefined,
    }
  },
  async mounted() {
    if (this.item?.locale) {
      let { country, language, description } = await this.getLocaleDescription(
        this.item.locale
      );
      if (description) this.localeDescription = description;
      if (country) this.country = country;
      if (language) this.language = language;
    }
  },
  computed: {
    ...mapState("shows", ["categories"]),
  },
  methods: {
    formatK,
    async getLocaleDescription(locale) {
      let language, country;
      let [langCode, countryCode] = locale.split("-");
      language = await this.$languages.getSmart(langCode);
      if (countryCode) {
        country = await this.$languages.countryFromCode(countryCode);
      }
      let description = `${language ? this.$t(language.name) : ""}`;
      if (country) description += ` (${this.$t(country.name)})`;
      return { country, language, description };
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/variables.scss";

.statistics span+span::before {
  content: " · ";
  margin: 0 0.25rem;
}

</style>