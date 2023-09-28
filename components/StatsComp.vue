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
          {{ $tb("Videos with Subs") }}
        </div>
        <div style="flex: 1" class="text-center">
          <router-link :to="{ name: 'stats' }">
            <b class="stat-big-number">{{ stats.languageData.length }}</b>
          </router-link>
          <br />
          {{ $tb("Languages") }}
        </div>
      </div>
    </div>
    <div class="stats-full" v-if="variant === 'full'">
      <div class="stats-header bg-light-or-dark p-2">
        <div
          class="stats-summary"
          style="margin: 0 auto; width: 15rem; line-height: 1.1"
        >
          <div class="d-flex">
            <div style="flex: 1; white-space: nowrap" class="text-center">
              <b class="stat-big-number">{{
                formatNumber(stats.totalCount)
              }}</b>
              <!-- show delta -->
              <small
                v-if="previousStats"
                :set="(delta = stats.totalCount - previousStats.totalCount)"
              >
                <span v-if="delta > 0" class="text-success">
                  <i class="fas fa-arrow-up"></i>
                  {{ formatNumber(Math.abs(delta)) }}
                </span>
                <span v-else-if="delta < 0" class="text-danger">
                  <i class="fas fa-arrow-down"></i>
                  {{ formatNumber(Math.abs(delta)) }}
                </span>
              </small>
              <br />
              {{ $tb("Videos") }}
            </div>
            <div style="flex: 1" class="text-center">
              <b class="stat-big-number">{{ stats.languageData.length }}</b>
              <br />
              {{ $tb("Languages") }}
            </div>
          </div>
        </div>
        <div class="text-center mt-3" v-if="$adminMode">
          <b-button :variant="$skin" size="sm" @click="getStats(true)">
            <template v-if="gettingStats">
              <b-spinner small />
            </template>
            <template v-else>
              <i class="fas fa-sync mr-1"></i> {{ $tb("Refresh") }}
            </template>
          </b-button>
        </div>
      </div>
      <table :class="`mt-4 table table-${$skin}`">
        <thead>
          <tr>
            <th style="width: 3.5rem">{{ $tb("Code") }}</th>
            <th style="width: 3.5rem">{{ $tb("ID") }}</th>
            <th>{{ $tb("Language") }}</th>
            <th>{{ $tb("Video Count") }}</th>
            <th v-if="languageData[0]?.tokenizerName">
              {{ $tb("Lemmatizer") }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in languageData"
            :key="`lang-count-${row.language.id}`"
          >
            <td>
              <small>{{ row.language.code }}</small>
            </td>
            <td>
              <small>{{ row.language.id }}</small>
            </td>
            <td>
              <router-link
                :to="{
                  name: 'recommended-video',
                  params: {
                    l1: supportedL1s(
                      row.language['iso639-3'],
                      $browserLanguage
                    )?.[0]?.code,
                    l2: row.language.code,
                  },
                }"
              >
                {{ $tb(row.language.name) }}
              </router-link>
            </td>
            <td>
              {{ formatNumber(row.count) }}
              <!-- Show delta from previously loaded stats with green and red arrows and numbers -->
              <small
                v-if="previousLanguageData"
                :set="
                  (delta =
                    row.count -
                    previousLanguageData.find(
                      (l) => l.language.id === row.language.id
                    )?.count)
                "
              >
                <span v-if="delta > 0" class="text-success">
                  <i class="fas fa-arrow-up"></i>
                  {{ formatNumber(Math.abs(delta)) }}
                </span>
                <span v-else-if="delta < 0" class="text-danger">
                  <i class="fas fa-arrow-down"></i>
                  {{ formatNumber(Math.abs(delta)) }}
                </span>
              </small>
            </td>
            <td v-if="row.tokenizerName">
              <small v-if="row.tokenizerName !== 'Base'">{{
                row.tokenizerName
              }}</small>
              <small v-else>
                Default ({{ row.tokenizationType }})
              </small>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { proxy, LP_DIRECTUS_TOOLS_URL } from "@/lib/utils";

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
    previousStats: undefined,
    stats: undefined,
    previousLanguageData: [],
    languageData: [],
    gettingStats: false,
  }),
  async mounted() {
    if (process.client) {
      const scriptSrc = "/js/tokenizers/tokenizer-factory.js";

      // Check if the script is already in the document
      if (!document.querySelector(`script[src="${scriptSrc}"]`)) {
        const script = document.createElement("script");
        script.src = scriptSrc;
        script.async = true;
        document.head.appendChild(script);
      }
    }
    await this.getStats();
  },
  computed: {
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
    supportedL1s(iso639_3, preferredL1Code) {
      return this.$languages.supportedL1s(iso639_3, preferredL1Code);
    },
    async getStats(refresh = false) {
      this.gettingStats = true;
      let data = await proxy(
        `${LP_DIRECTUS_TOOLS_URL}count-all.php${
          refresh ? "?timestamp=" + Date.now() : ""
        }`,
        { cacheLife: refresh ? 0 : 86400 } // cache the count for one day (86400 seconds)
      );
      if (this.stats) this.previousStats = this.stats;
      if (this.languageData) this.previousLanguageData = this.languageData;
      if (data?.langCounts) {
        let languages = await this.$languagesPromise;
        if (!languages) return;
        let languageData = [];
        for (let langId in data.langCounts) {
          const count = data.langCounts[langId];
          const language = languages.getById(langId);
          if (language) {
            let tokenizerName, tokenizationType;
            if (typeof TokenizerFactory !== "undefined") {
              tokenizerName = TokenizerFactory.getTokenizerName(
                language["iso639-3"] || language["glottologId"]
              );
              if (tokenizerName)
                tokenizerName = tokenizerName.replace("Tokenizer", "");
              tokenizationType = TokenizerFactory.getTokenizationType(
                language
              );
            }
            languageData.push({
              count,
              language,
              tokenizerName,
              tokenizationType
            });
          }
          this.languageData = languageData.sort((a, b) => b.count - a.count);
        }
        data.languageData = languageData;
        this.stats = data;
      }
      this.gettingStats = false;
      if (this.previousStats)
        this.$toast.success(this.$tb("Stats updated"), {
          position: "top-center",
          duration: 5000,
        });
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
@import "@/assets/scss/variables.scss";

.stats-dark {
  .stat-big-number {
    color: #1bd445;
  }
}

.stats-light {
  .stat-big-number {
    color: $primary-color;
  }
}

.stat-big-number {
  font-size: 1.5rem;
}
.total-count {
  margin-top: 1rem;
}

.stats-header {
  position: sticky;
  top: 0;
}
</style>
