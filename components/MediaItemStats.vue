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
    <span
      v-if="showLevel && item.difficulty"
      :data-level="levelByDifficulty(item.difficulty, $l2.code)"
      class="text-bold"
    >
      {{ level(levelByDifficulty(item.difficulty, $l2.code), $l2).name }}
    </span>
    <span class="statistics-item" v-if="item.locale">
      <img v-if="country" :alt="`Flag of ${country.name}`" :title="`Flag of ${country.name} (${country.alpha2Code})`"
        :src="`/vendor/flag-svgs/${country.alpha2Code}.svg`" class="flag-icon mr-1"
        style="width: 1rem; position: relative; bottom: 0.1rem" />
      {{ localeDescription || item.locale }}
    </span>
    <span>
      <router-link class="statistics-item" v-if="item.category && CATEGORIES[item.category]" :to="{ name: 'category', params: { slug: item.category } }" style="color: inherit">
        {{ $t(CATEGORIES[item.category]) }}
      </router-link>
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
import { formatK, level, levelByDifficulty } from "../lib/utils";
import { CATEGORIES, } from "../lib/youtube";

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
    showLevel: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      localeDescription: undefined,
      country: undefined,
      language: undefined,
      CATEGORIES
    }
  },
  async mounted() {
    this.updateLocaleDescription();
  },
  computed: {
    ...mapState("shows", ["categories"]),
  },
  watch: {
    async item() {
      this.updateLocaleDescription();
    },
  },
  methods: {
    level,
    levelByDifficulty,
    formatK,
    async updateLocaleDescription() {
      if (this.item?.locale) {
        const { country, language, description } = await this.getLocaleDescription(this.item.locale);
        this.country = country;
        this.language = language;
        this.localeDescription = description;
      }
    },
    async getLocaleDescription(locale) {
      let language, country, script;
      let [langCode, countryCodeOrScript] = locale.split("-");
      language = await this.$languages.getSmart(langCode);
      if (countryCodeOrScript) {
        const scripts = [
          { code: 'Hans', name: 'Simplified' },
          { code: 'Hant', name: 'Traditional' },
          { code: 'Latn', name: 'Latin' },
          { code: 'Cyrl', name: 'Cyrillic' },
        ];
        script = scripts.find(s => s.code === countryCodeOrScript)
        if (!script){
          const countryCode = countryCodeOrScript;
          country = await this.$languages.countryFromCode(countryCode);
        }
      }
      let description = `${language ? this.$t(language.name) : ""}`;
      if (country) description += ` (${this.$t(country.name)})`;
      if (script) description += ` (${this.$t(script.name)})`;
      return { country, language, description };
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../assets/scss/variables.scss";

.statistics span+span::before {
  content: " · ";
  margin: 0 0.25rem;
}

</style>