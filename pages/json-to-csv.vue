<router>
  {
    path: '/:l1/:l2/json-to-csv'
  }
</router>
<template>
  <div class="main">
    <div class="container pt-5 mb-5">
      <div class="row">
        <div class="col-sm-12">
          <h3 class="text-center mb-5">Convert JSON to CSV</h3>
          <p>Optimized for converting the <a href="https://github.com/PasaOpasen/PersianG2P">PersianG2p</a> data file.</p>
          <b-form-file
            v-model="file"
            :state="Boolean(file)"
            placeholder="Choose a JSON file or drop it here..."
            drop-placeholder="Drop JSON file here..."
          ></b-form-file>
          <div class="mt-3" v-if="file">
            <b>Received:</b>
            {{ file ? file.name : "" }}
          </div>
          <div class="mt-3" v-if="file">
            <b-button variant="primary" @click="convert">
              Convert to CSV
            </b-button>
          </div>
          <div v-if="href">
            <hr />
            CSV Ready.
            <a :href="href" :download="`${file.name.replace('.json', '')}.csv`">
              Download
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Helper from "@/lib/helper";
export default {
  computed: {
  },
  data() {
    return {
      file: null,
      filename: undefined,
      href: undefined,
    };
  },
  async mounted() {},
  methods: {
    // This is made for converting persianG2p.json
    convert() {
      console.log(this.file);
      let reader = new FileReader();
      reader.readAsText(this.file);
      reader.onload = (event) => {
        let json = event.target.result;
        let parsed = JSON.parse(json);
        let arr = [];
        for (let key in parsed) {
          let val = parsed[key];
          arr.push({
            persian: key,
            roman: val
              .replace(/\s/g, "")
              .replace(/A/g, "ā")
              .replace(/S/g, "š")
              .replace(/Z/g, "ž")
              .replace(/C/g, "č")
              .replace(/\?/g, "`"),
          });
        }
        let csv = Papa.unparse(arr);
        this.href = Helper.makeTextFile(csv);
      };
    },
  },
};
</script>

<style>
</style>