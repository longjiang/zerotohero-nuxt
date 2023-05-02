<router>
  {
    path: '/corpora-csv'
  }
</router>
<template>
  <div class="main">
    <div class="container pt-5 mb-5">
      <div class="row">
        <div class="col-sm-12">
          <div v-if="href">
            CSV Ready.
            <a :href="href" :download="`sketch-engine-corpora.csv.txt`">
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
import axios from "axios";
import { makeTextFile } from "@/lib/utils";

export default {
  data() {
    return {
      href: undefined,
      fields: [
        "language_id",
        "is_featured",
        "corpname",
        "wordcount",
        "aligned",
        "diachronic",
        "tags",
        "language_name",
        "info",
        "name",
      ],
    };
  },
  async mounted() {
    this.exportCorporaCSV();
  },
  methods: {
    async exportCorporaCSV() {
      let res = await axios.get(
        "/data/sketch-engine/sketch-engine-corpora.json.txt"
      );
      if (res && res.data) {
        let SketchEngineCorpora = res.data;
        let data = SketchEngineCorpora.map((corpus) => {
          let o = {};
          for (let f of this.fields) {
            let info = corpus[f];
            if (f === "wordcount") info = corpus.sizes.wordcount;
            o[f] = info;
          }
          return o;
        });
        let csv = Papa.unparse(data);
        this.href = makeTextFile(csv);
      }
    },
  },
};
</script>

<style>
</style>