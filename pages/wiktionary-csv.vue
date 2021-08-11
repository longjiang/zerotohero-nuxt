<router>
  {
    path: '/:l1/:l2/wiktionary-csv'
  }
</router>
<template>
  <div class="main">
    <div class="container pt-5 mb-5">
      <div class="row">
        <div class="col-sm-12">
          <div v-if="href">
            CSV Ready.
            <a :href="href" :download="`${$l2['iso639-3']}-eng.csv.txt`">
              Download
            </a>
          </div>
          <div v-else>Preparing CSV...</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Helper from "@/lib/helper";
export default {
  computed: {
    $l1() {
      return this.$store.state.settings.l1;
    },
    $l2() {
      return this.$store.state.settings.l2;
    },
  },
  data() {
    return {
      href: undefined,
    };
  },
  async mounted() {
    this.testWiktionaryCSVExport();
  },
  methods: {
    async testWiktionaryCSVExport() {
      let dictionary = await this.$getDictionary();
      let csv = await (await dictionary).exportCSV();
      this.href = Helper.makeTextFile(csv);
    },
  },
};
</script>

<style>
</style>