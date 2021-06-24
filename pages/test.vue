<router>
  {
    path: '/:l1/:l2/test'
  }
</router>
<template>
  <div>
    <div class="main container mt-5 mb-5">
      <div class="row">
        <div class="col-sm-12">
          CSV Ready. <a :href="href" download="fra-eng.csv.txt">Download</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  // layout: "test-layout",
  computed: {
    l1() {
      return this.$store.state.settings.l1;
    },
    l2() {
      return this.$store.state.settings.l2;
    },
  },
  data() {
    return {
      showTestEntry: false,
      entry: undefined,
      href: undefined
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
      this.href = this.makeTextFile(csv)
    },
    async testFrench() {
      let dictionary = await this.$getDictionary();
      let word = await (await dictionary).lookup("suivre");
      console.log(await (await dictionary).wordForms(word));
    },
    async testDictionary() {
      let dictionary = await this.$getDictionary();
      this.entry = await (await dictionary).lookup("你好");
    },
    async testRandom() {
      let dictionary = await this.$getDictionary();
      console.log(await (await dictionary).random(), "dictionary.random()");
    },
    async testRandom() {
      let dictionary = await this.$getDictionary();
      console.log(await (await dictionary).random(), "dictionary.random()");
    },
  },
};
</script>

<style>
</style>