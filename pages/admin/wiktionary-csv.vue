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
            Wiktionary CSV Ready.
            <a :href="href" :download="`${$l2['iso639-3']}-eng.csv.txt`">
              Download Wiktionary CSV
            </a>
          </div>
          <div v-if="languagesHref">
            Languages CSV Ready.
            <a :href="languagesHref" :download="`common-languages.csv.txt`">
              Download Languages CSV
            </a>
          </div>
          <div v-else>Preparing CSV...</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { makeTextFile } from "@/lib/helper";
export default {
  computed: {
  },
  data() {
    return {
      href: undefined,
      languagesHref: undefined
    };
  },
  async mounted() {
    this.languageCSVExport();
    this.wiktionaryCSVExport();
  },
  methods: {
    async wiktionaryCSVExport() {
      let dictionary = await this.$getDictionary();
      if ((await dictionary).exportCSV) {
        let csv = await (await dictionary).exportCSV();
        this.href = makeTextFile(csv);
      }
    },
    async languageCSVExport() {
      let csv = await this.$languages.exportCSV();
      this.languagesHref = makeTextFile(csv);
    },
  },
};
</script>

<style>
</style>