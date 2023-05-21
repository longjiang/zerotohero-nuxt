<template>
  <div>
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
              <router-link
                :to="`/${pair.l1}/${pair.l2}/${feature.feature}`"
              >
                View
              </router-link>
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
};
</script>

<style scoped>
/* Add any styles you need for the table here. */
</style>
