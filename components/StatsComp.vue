<template>
  <div :class="`stats stats-${skin}`" v-if="stats && $languages">
    <div
      class="stats-summary"
      v-if="variant === 'summary'"
      style="margin: 0 auto; width: 15rem; line-height: 1.1"
    >
      <div class="d-flex">
        <div style="flex: 1" class="text-center">
          <router-link :to="{ name: 'stats' }">
            <b class="stat-big-number">{{ formatNumber(stats.totalCount) }}</b>
          </router-link>
          <br />
          {{ translate("Videos with Subs", browserLanguage) }}
        </div>
        <div style="flex: 1" class="text-center">
          <router-link :to="{ name: 'stats' }">
            <b class="stat-big-number">{{ stats.langs.length - 11 }}</b>
          </router-link>
          <br />
          {{ translate("Languages", browserLanguage) }}
        </div>
      </div>
    </div>
    <div class="stats-full" v-if="variant === 'full'">
      <div
        class="stats-summary"
        style="margin: 0 auto; width: 15rem; line-height: 1.1"
      >
        <div class="d-flex">
          <div style="flex: 1" class="text-center">
            <b class="stat-big-number">{{ formatNumber(stats.totalCount) }}</b>
            <br />
            {{ translate("Videos", browserLanguage) }}
          </div>
          <div style="flex: 1" class="text-center">
            <b class="stat-big-number">{{ stats.langs.length }}</b>
            <br />
            {{ translate("Languages", browserLanguage) }}
          </div>
        </div>
      </div>
      <div class="text-center mt-3">
        <b-button variant="success" size="small" @click="getStats(true)">
          <i class="fas fa-sync mr-1"></i>
          Refresh
        </b-button>
      </div>
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
                  name: 'explore-media',
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
import Helper from "@/lib/helper";

export default {
  props: {
    variant: {
      type: String,
      default: "full", // or 'summary'
    },
    skin: {
      type: String,
      default: "dark", // or 'light
    },
  },
  data: () => ({
    stats: undefined,
    languageData: [],
  }),
  async created() {
    await this.getStats();
  },
  computed: {
    browserLanguage() {
      if (process.browser) {
        let code = navigator.language.replace(/-.*/, "");
        if (
          this.langsWithEnDict &&
          this.langsWithEnDict.find((l) => l.code === code)
        )
          return code;
      }
      return "en";
    },
    langsWithEnDict() {
      if (this.$languages) {
        let langsWithEnDict = this.$languages.l1s.filter(
          (l) => l.dictionaries && l.dictionaries.eng
        );
        return langsWithEnDict;
      }
    },
  },
  methods: {
    translate(text, code) {
      if (this.$languages) return this.$languages.translate(text, code);
      else return text;
    },
    async getStats(refresh = false) {
      let data = await Helper.proxy(
        `https://directusvps.zerotohero.ca/count-all.php${
          refresh ? "?timestamp=" + Date.now() : ""
        }`,
        { cacheLife: refresh ? 0 : 86400 } // cache the count for one day (86400 seconds)
      );
      if (data?.langCounts) {
        this.stats = data;
        let languages = await this.$languagesPromise;
        if (!languages) return;
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
      }
    },
    // https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
    formatNumber(num) {
      if (num) return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    async getLangById(langId) {
      let languages = await this.$languagesPromise;
      if (languages) return languages.getById(langId);
    },
  },
};
</script>

<style lang="scss" scoped>
.stats-dark {
  .stat-big-number {
    color: #1bd445;
  }
}

.stats-light {
  .stat-big-number {
    color: #fd4f1c;
  }
}

.stat-big-number {
  font-size: 1.5rem;
}
.total-count {
  margin-top: 1rem;
}
</style>