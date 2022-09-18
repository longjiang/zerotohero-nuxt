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
          <!-- <Review
            v-bind='{
              "line":{"starttime":89.14,"duration":3.5,"line":"Est-ce que le respect du monde vivant, de la nature, ça n’devrait pas suffire ?","count":1},
              "lineIndex":17,
              "parallelLines":"Shouldn&#39;t respect for the living world, for nature, be enough?",
              "text":"suffi",
              "word":{"pronunciation":"sy.fiʁ","audio":"Fr-suffire.ogg","definitions":["to be enough, to suffice"],"pos":"verb","gender":"","search":"suffire","head":"suffire","wiktionary":true,"id":"w2292538401","phrases":[]},
              "simplified": undefined,
              "traditional": undefined,
              skin: "dark"
            }'
          /> -->
          <textarea v-model="text"></textarea>
          <textarea :value="output.join('\n')"></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Config from "@/lib/config";
import Helper from "@/lib/helper";
import pinyin from 'pinyin-tone'

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
      text: undefined,
      output: []
    };
  },
  mounted() {
    this.message = `navigator.hardwareConcurrency is ${navigator.hardwareConcurrency}`;
  },
  watch: {
    async text() {
      let dictionary = await this.$getDictionary()
      let output = []
      for (let line of this.text.split("\n")) {
        line = line.replace(/(\d+)(.)/g, "$1 $2")
        line = pinyin(line)
        let words = await dictionary.lookupByPinyin(line)
        if (words && words.length > 0) {
          output.push(words.map(w => w.simplified).slice(0,2).join("/"))
        } else {
          output.push(line)
        }
      }
      this.output = output
    }
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