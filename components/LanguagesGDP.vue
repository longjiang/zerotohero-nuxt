<template>
  <div class="lang-gdp">
    <p class="text-center text-secondary">
      Languages by % of World GDP PPP 2018 (
      <a
        href="https://www.reddit.com/r/languagelearning/comments/9i72xd/the_20_languages_that_produce_86_of_the_worlds/"
        target="_blank"
      >
        Source
      </a>
      )
    </p>

    <div
      v-for="lang of langs"
      :key="`lang-gdp-item-${lang.code}`"
      class="d-flex mt-1 mb-1 ml-auto mr-auto"
      style="max-width: 30rem"
      :set="(path = `/en/${lang.code}/`)"
    >
      <div style="width: 7rem; color: #666">
        <NuxtLink :to="path" v-if="lang.code" class="link-unstyled">
          {{ lang.name }}
        </NuxtLink>
        <div v-else>{{ lang.name }}</div>
      </div>
      <b-progress
        :max="langs[0].gdp * 100"
        variant="success"
        style="flex: 1; background: none; margin-top: 0.2rem;"
      >
        <b-progress-bar
          :value="lang.gdp * 100"
          class="gdp-progress-bar"
        ></b-progress-bar>
      </b-progress>
      <div style="width: 3rem; margin-top: 0.15rem" class="ml-2 small">
        {{ Number(lang.gdp * 100).toFixed(2) }}%
      </div>
    </div>
  </div>
</template>

<script>
import Papa from "papaparse";
export default {
  data() {
    return {
      langs: [],
      csv: `code	gdp
en	0.206
zh	0.2
es	0.064
ar	0.047
ja	0.042
de	0.04
ru	0.032
hi	0.032
pt	0.029
id	0.026
fr	0.024
it	0.018
tr	0.017
ko	0.016
fa	0.014
bn	0.012
nl	0.011
th	0.01
pl	0.009
pa	0.008
others	0.143`,
    };
  },
  props: {},
  mounted() {
    let langs = Papa.parse(this.csv, { header: true }).data;
    for (let lang of langs) {
      if (lang.code !== "others") {
        let language = this.$languages.getSmart(lang.code);
        lang.name = language.name;
      } else {
        lang.name = "All others";
        delete lang.code;
      }
    }
    this.langs = langs;
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
.gdp-progress-bar {
  background-color: #f4d03f;
  background-image: linear-gradient(228deg, #f4d03f 0%, #16a085 100%);
  background-size: 50vw;
  border-radius: 0.5rem;
}
</style>
