<template>
  <div class="stats" v-if="stats && $languages">
    <div class="stats-summary" v-if="variant === 'summary'" style="margin: 0 auto; width: 15rem; line-height: 1.1">
      <div class="d-flex">
        <div style="flex: 1" class="text-center">
          <b class="stat-big-number">{{ formatNumber(stats.totalCount) }}</b>
          <br />
          Videos
        </div>
        <div style="flex: 1" class="text-center">
          <b class="stat-big-number">{{ stats.langs.length }}</b>
          <br />
          Languages
        </div>
      </div>
    </div>
    <div class="stats-full" v-if="variant === 'full'">
      <table class="mt-4 table">
        <thead>
          <tr>
            <th>Language</th>
            <th>Video Count</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in languageData"
            :key="`lang-count-${row.language.id}`"
          >
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
  </div>
</template>

<script>
import axios from "axios";
export default {
  props: {
    variant: {
      type: String,
      default: "full", // or 'summary'
    },
  },
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
.stat-big-number {
  color: #1bd445;
  font-size: 1.5rem;
}
.total-count {
  margin-top: 1rem;
}
</style>