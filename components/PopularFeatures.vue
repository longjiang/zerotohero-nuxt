<template>
  <div>
    <div v-if="!pairs.length" class="mt-5 mb-5 text-center"><Loader :sticky="true" /></div>
    <div class="table-responsive">
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
  data() {
    return {
      pairs: [],
      features: [],
    };
  },
  async mounted() {
    const responsePairs = await axios.get(
      PYTHON_SERVER + "/ga-popular-language-pairs"
    );
    this.pairs = responsePairs.data.pairs.slice(0, 10); // get only top 10

    const responseFeatures = await axios.get(
      PYTHON_SERVER + "/ga-popular-features"
    );
    this.features = responseFeatures.data.features.slice(0, 10); // get only top 10
  },
  methods: {
    topPaths(feature, pair) {
      return Array.from(
        new Set(
          feature.language_pairs[pair.l1 + "/" + pair.l2]?.top_paths.map(
            (path) => path.replace(/\/$/, "")
          )
        )
      );
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
