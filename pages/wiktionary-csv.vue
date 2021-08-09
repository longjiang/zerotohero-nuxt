<router>
  {
    path: '/:l1/:l2/wiktionary-csv'
  }
</router>
<template>
  <div>
    <div class="main container pt-5 mb-5">
      <div class="row">
        <div class="col-sm-12">
          <div v-if="href">
            CSV Ready.
            <a :href="href" :download="`${$l2['iso639-3']}-eng.csv.txt`">Download</a>
          </div>
          <div v-else>Preparing CSV...</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  // layout: "test-layout",
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
    makeTextFile(text) {
      var data = new Blob([text], { type: "text/plain" });

      // If we are replacing a previously generated file we need to
      // manually revoke the object URL to avoid memory leaks.
      if (textFile !== null) {
        window.URL.revokeObjectURL(textFile);
      }

      var textFile = window.URL.createObjectURL(data);

      // returns a URL you can use as a href
      return textFile;
    },
    async testWiktionaryCSVExport() {
      let dictionary = await this.$getDictionary();
      let csv = await (await dictionary).exportCSV();
      this.href = this.makeTextFile(csv);
    },
  },
};
</script>

<style>
</style>