<router>
  {
    path: '/:l1/:l2/test'
  }
</router>
<template>
  <div class="main">
    <div class="container pt-5 pb-5">
      <div class="row">
        <div class="col-sm-12">
          <LanguageList variant="grid" :showFeatures="false" :showFlags="true" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Config from '@/lib/config'
import Helper from '@/lib/helper'
export default {
  computed: {
    $l1() {
      return this.$store.state.settings.l1;
    },
    $l2() {
      return this.$store.state.settings.l2;
    },
    $dictionaryName() {
      return this.$store.state.settings.dictionaryName;
    },
  },
  data() {
    return {
      showTestEntry: false,
      entry: undefined,
      href: undefined,
      message: undefined
    };
  },
  mounted() {
    this.message = `navigator.hardwareConcurrency is ${navigator.hardwareConcurrency}`;
  },
  methods: {
    async dicMerge() {
      let res = await axios.get(`${Config.server}data/persian-g2p/tihudictBIG-and-wiktionary-merged.csv.txt`)
      let parsed = Papa.parse(res.data, { header: true })
      let rows = parsed.data
      console.log(rows.length)
      rows = Helper.uniqueByValue(rows, 'persian')
      console.log(rows.length)
      let csv = Papa.unparse(rows);
      this.href = Helper.makeTextFile(csv);
    },
    // https://stackoverflow.com/questions/19754792/measure-cpu-performance-via-js
    testSpeed() {
      var _speedconstant = 1.15600e-8; //if speed=(c*a)/t, then constant=(s*t)/a and time=(a*c)/s
      var d = new Date();
      var amount = 150000000;
      for (var i = amount; i > 0; i--) { }
      var newd = new Date();
      var accnewd = Number(String(newd.getSeconds()) + "." + String(newd.getMilliseconds()));
      var accd = Number(String(d.getSeconds()) + "." + String(d.getMilliseconds()));
      var di = accnewd - accd;
      //console.log(accnewd,accd,di);
      if (d.getMinutes() != newd.getMinutes()) {
        di = (60 * (newd.getMinutes() - d.getMinutes())) + di
      }
      let spd = ((_speedconstant * amount) / di);
      let ghz = Math.round(spd * 1000) / 1000
      return ghz
    },
    async dictionarySize() {
      let dictionary = await this.$getDictionary();
      let size = await (await dictionary).getSize();
      console.log(`The dictionary has ${size} entries.`);
    },
    async testFrenchTokenization() {
      // let dictionary = await this.$getDictionary();
      // let word = await (await dictionary).lookup("suivre");
      // console.log(await (await dictionary).wordForms(word));
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