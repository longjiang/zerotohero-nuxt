<template>
  <div>
    <div v-if="loading" class="mt-5 mb-5 text-center">
      <Loader :sticky="true" />
    </div>
    <div class="table-responsive" v-if="!loading">
      <table class="table">
        <thead>
          <tr>
            <th>Language Pair</th>
            <th>Page Views</th>
            <th>Percentage of Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(pair, index) in pairs" :key="index">
            <td>
              <router-link
                :to="{
                  name: 'explore-media',
                  params: { l1: pair.l1, l2: pair.l2 },
                }"
              >
                {{ pair.l1 }}/{{ pair.l2 }}
              </router-link>
            </td>
            <td>
              {{ pair.count }}
            </td>
            <td>{{ ((pair.count / totalPageViews) * 100).toFixed(2) }}%</td>
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
  data() {
    return {
      pairs: [],
      loading: false,
      totalPageViews: 0,
    };
  },
  async mounted() {
    this.fetchPairs();
  },
  methods: {
    async fetchPairs() {
      this.loading = true
      const response = await axios.get(
        `${PYTHON_SERVER}ga-popular-language-pairs` +
          (this.startDate ? `?start_date=${this.startDate}` : "")
      );
      this.pairs = response.data.pairs.slice(0, 10); // get only top 10
      this.totalPageViews = this.pairs.reduce(
        (total, pair) => total + pair.count,
        0
      );
      this.loading = false
    },
  },
};
</script>

<style scoped>
/* Add any styles you need for the table here. */
</style>
