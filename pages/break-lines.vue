<router>
  {
    path: '/:l1/:l2/break-lines'
  }
</router>
<template>
  <div>
    <div class="main container mt-5 mb-5">
      <div class="row">
        <div class="col-sm-12">
          Break on punctuations:
          <b-form-input
            v-model="punctuations"
            placeholder="Punctuations"
          ></b-form-input>
        </div>
      </div>
      <div class="row mt-4">
        <div class="col-md-6">
          Input text:
          <b-form-textarea
            v-model.lazy="text"
            style="height: calc(100vh - 10rem)"
          ></b-form-textarea>
        </div>
        <div class="col-md-6">
          Output text:
          <b-form-textarea
            v-model="output"
            :lazy="true"
            style="height: calc(100vh - 10rem)"
          ></b-form-textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Helper from "@/lib/helper";
export default {
  // layout: "test-layout",
  computed: {
    $l1() {
      return this.$store.state.settings.l1;
    },
    $l2() {
      return this.$store.state.settings.l2;
    },
    output() {
      let text = this.text;
      text = this.normalizeNotes(text);
      text = this.breaklines(text);
      return text;
    },
  },
  data() {
    return {
      text: "",
      punctuations: "。！？；：!?;:♪",
    };
  },
  async mounted() {},
  methods: {
    breaklines(text) {
      return text
        .replace(new RegExp(`([${this.punctuations}])\n`, "g"), "$1")
        .replace(new RegExp(`([${this.punctuations}])`, "g"), "$1\n")
        .replace(/\n([”″」’]+)/g, "$1\n")
        .replace(/^\s*\n/gm, "")
        .replace(/\n$/m, "");
    },
    normalizeNotes(text) {
      let normalized = text.replace(/[(（【［\[]*(\d+)[)）】］\]]*/g, "[$1]");
      normalized = Helper.normalizeCircleNumbers(normalized);
      return normalized;
    },
  },
};
</script>

<style>
</style>