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
    };
  },
  mounted() {
    console.log(Helper.mutuallyExclusive(['az', 'azokként', 'azokkal', 'azoknak', 'azokban', 'azokért', 'azoknál', 'azokhoz', 'azokból', 'azoktól', 'azokról', 'azokat', 'azokig', 'akként', 'azokba', 'azokká', 'azokon', 'azokra', 'azért', 'addig', 'annak', 'abban', 'ahhoz', 'azzal', 'arról', 'annál', 'abból', 'attól', 'abba', 'arra', 'azon', 'azok', 'azzá', 'azt', 'azé']))
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