<template>
  <div class="stats" v-if="stats && $languages">
    <div class="total-count">
      <b>Total Video Count:</b>
      {{ formatNumber(stats.totalCount) }}
    </div>
    <div class="total-count">
      <b>Total Language Count:</b>
      {{ stats.langs.length }}
    </div>
    <table class="mt-4 table">
      <thead>
        <tr>
          <th>Language</th>
          <th>Video Count</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in languageData" :key="`lang-count-${row.language.id}`">
          <td>
            <router-link
              :to="{
                name: 'all-media',
                params: { l1: 'en', l2: row.language.code },
              }"
            >
              {{ row.language.name }}
              <small>({{ row.language.code }}, #{{ row.language.id }})</small>
            </router-link>
          </td>
          <td>{{ formatNumber(row.count) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from "axios";
export default {
  data: () => ({
    stats: undefined,
    languageData: [],
  }),
  async created() {
    let res = await axios.get("https://db2.zerotohero.ca/count-all.php");
    this.stats = res.data;
    let languages = await this.$languagesPromise;
    let languageData = [];
    for (let langId in this.stats.langCounts) {
      const count = this.stats.langCounts[langId];
      const language = languages.getById(langId);
      if (language)
        languageData.push({
          count,
          language,
        });
      this.languageData = languageData.sort((a, b) => b.count - a.count);
    }
  },
  computed: {},
  methods: {
    // https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
    formatNumber(num) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    getLangById(langId) {
      if (this.$languages) return this.$languages.getById(langId);
    },
  },
};
</script>

<style lang="scss" scoped>
.total-count {
  margin-top: 1rem;
}
</style>