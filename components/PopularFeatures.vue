<template>
  <div>
    <div v-if="loading" class="mt-5 mb-5 text-center">
      <Loader :sticky="true" />
    </div>
    <div v-if="!loading" class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th>Feature / Language Pair</th>
            <th v-for="(pair, index) in pairs.slice(0, 10)" :key="index">
              {{ pair.l1 }}/{{ pair.l2 }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(feature, index) in features.slice(0, 10)" :key="index">
            <th>{{ feature.feature }}</th>
            <td v-for="(pair, index) in pairs.slice(0, 10)" :key="index">
              <span v-if="feature.language_pairs?.[pair.l1 + '/' + pair.l2]">
                <!-- show top paths in the given language pair, removing trailing slash, and make sure they are unique -->
                <router-link
                  :to="path"
                  v-for="(path, index) in topPaths(feature, pair)"
                  :key="index"
                  class="feature-link"
                >
                  {{ index + 1 }}
                </router-link>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { PYTHON_SERVER } from "@/lib/utils";

export default {
  props: {
    startDate: {
      type: String, // YYYY-MM-DD
      required: false,
    },
  },
  watch: {
    startDate() {
      this.fetchFeatures();
    },
  },
  data() {
    return {
      pairs: [],
      features: [],
      loading: false,
      unavailablePaths: [
        "/en/zh/show/tv-show/142",
        "/en/ja/show/tv-show/1389",
        "/en/ja/show/tv-show/958",
        "/en/ja/video-view/youtube/_FB9JZe0L1w",
      ],
    };
  },
  async mounted() {
    this.fetchFeatures();
  },
  methods: {
    topPaths(feature, pair) {
      let paths = Array.from(
        new Set(
          feature.language_pairs[pair.l1 + "/" + pair.l2]?.top_paths.map(
            (path) => path.replace(/\/$/, "")
          )
        )
      );
      return paths.filter((path) => !this.unavailablePaths.includes(path));
    },
    async fetchFeatures() {
      this.loading = true;
      const responsePairs = await axios.get(
        PYTHON_SERVER +
          "ga-popular-language-pairs" +
          (this.startDate ? `?start_date=${this.startDate}` : "")
      );
      this.pairs = responsePairs.data.pairs.slice(0, 10); // get only top 10

      const responseFeatures = await axios.get(
        PYTHON_SERVER +
          "ga-popular-features" +
          (this.startDate ? `?start_date=${this.startDate}` : "")
      );
      this.features = responseFeatures.data.features.slice(0, 10); // get only top 10
      this.loading = false;
    },
  },
};
</script>

<style scoped>
/* Add any styles you need for the table here. */
/* Two feature links should be separated by a pipe */
.feature-link + .feature-link:before {
  content: " | ";
}

table th,
table td {
  white-space: nowrap;
}
</style>
