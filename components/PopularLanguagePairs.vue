<template>
  <div>
    <div v-if="!pairs.length" class="mt-5 mb-5 text-center"><Loader :sticky="true" /></div>
    <div class="table-responsive" v-if="pairs.length">
      <table class="table">
        <thead>
          <tr>
            <th>Language Pair</th>
            <th>Count</th>
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
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      pairs: [],
    };
  },
  async mounted() {
    const response = await axios.get(
      "https://python.zerotohero.ca/ga-popular-language-pairs"
    );
    this.pairs = response.data.pairs.slice(0, 10); // get only top 10
  },
};
</script>

<style scoped>
/* Add any styles you need for the table here. */
h4 {
  margin-bottom: 1rem;
}
</style>
