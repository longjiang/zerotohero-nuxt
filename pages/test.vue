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
          <div class="bing-clipping">
            <div
              :class="`blocking-div ${clickthrough ? 'clickthrough' : ''}`"
              @mouseover="futurePaste()"
            >
              <i class="fas fa-language" v-if="!pasted"></i>
              <i class="fas fa-check" v-if="pasted"></i>
            </div>
            <iframe
              class="bing-iframe"
              :src="`https://www.bing.com/translator/?from=auto&to=en&text=${text}`"
              frameborder="0"
            ></iframe>
          </div>
          <button @click="paste">Paste</button>
          <div>{{ pasted }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Config from "@/lib/config";
import Helper from "@/lib/helper";

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
      message: undefined,
      pasted: undefined,
      clickthrough: false,
      text: `The biodiversity plan of the Minister of Ecology is supposed to slow down the disastrous effects of human activity on the living world. While the situation is dramatic, associations criticize the lack of means implemented. Review of the most alarming signs.
The situation is serious. It may even be too late to save biodiversity. For several years, scientists have been warning about the mass extinction of animals. A phenomenon that continues to accelerate and whose effects could be irremediable. In July 2017, researchers at Stanford University spoke of "biological annihilation" in progress.
Is it already too late? Elements of response with the Matins de France Culture:
Find out more: Biodiversity plan: is it too late?
The situation is such that our planet would experience a sixth mass extinction of biodiversity. But this time, the cause is not to be sought on the side of exceptional volcanic activity or meteorites.
The man is responsible. The impact of our activity is not new. dddddddd`,
    };
  },
  mounted() {
    this.message = `navigator.hardwareConcurrency is ${navigator.hardwareConcurrency}`;
  },
  methods: {
    async paste() {
      this.pasted = await navigator.clipboard.readText();
    },
    async futurePaste() {
      if (!this.pasted) {
        navigator.clipboard.writeText('');
        this.clickthrough = true;
        await Helper.timeout(1000);
        this.paste();
        this.clickthrough = false;
      }
    },
    async dicMerge() {
      let res = await axios.get(
        `${Config.server}data/persian-g2p/tihudictBIG-and-wiktionary-merged.csv.txt`
      );
      let parsed = Papa.parse(res.data, { header: true });
      let rows = parsed.data;
      console.log(rows.length);
      rows = Helper.uniqueByValue(rows, "persian");
      console.log(rows.length);
      let csv = Papa.unparse(rows);
      this.href = Helper.makeTextFile(csv);
    },
    // https://stackoverflow.com/questions/19754792/measure-cpu-performance-via-js
    testSpeed() {
      var _speedconstant = 1.156e-8; //if speed=(c*a)/t, then constant=(s*t)/a and time=(a*c)/s
      var d = new Date();
      var amount = 150000000;
      for (var i = amount; i > 0; i--) {}
      var newd = new Date();
      var accnewd = Number(
        String(newd.getSeconds()) + "." + String(newd.getMilliseconds())
      );
      var accd = Number(
        String(d.getSeconds()) + "." + String(d.getMilliseconds())
      );
      var di = accnewd - accd;
      //console.log(accnewd,accd,di);
      if (d.getMinutes() != newd.getMinutes()) {
        di = 60 * (newd.getMinutes() - d.getMinutes()) + di;
      }
      let spd = (_speedconstant * amount) / di;
      let ghz = Math.round(spd * 1000) / 1000;
      return ghz;
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

<style lang="scss" scoped>
.bing-clipping {
  width: 50px;
  height: 50px;
  overflow: hidden;
  position: relative;
  border: 1px solid chocolate;
  .blocking-div {
    background: #ff0000;
    width: 50px;
    height: 50px;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 99999999999999999999;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    &.clickthrough {
      pointer-events: none;
    }
  }
  .bing-iframe {
    overflow: hidden;
    width: 1000px;
    height: 2000px;
    position: absolute;
    left: -617px;
    top: -1053px;
  }
}
</style>