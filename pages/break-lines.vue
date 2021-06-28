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
            v-model.lazy="output"
            style="height: calc(100vh - 10rem)"
          ></b-form-textarea>
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
    output() {
      return this.text
        .replace(new RegExp(`([${this.punctuations}])\n`, "g"), "$1")
        .replace(new RegExp(`([${this.punctuations}])`, "g"), "$1\n")
        .replace(/\n”/g, "”\n");
    },
  },
  data() {
    return {
      text: "",
      punctuations: "。！？；：!?;:",
    };
  },
  async mounted() {},
  methods: {},
};
</script>

<style>
</style>