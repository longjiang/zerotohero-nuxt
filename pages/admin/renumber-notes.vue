<template>
  <div class="main">
    <div class="container pt-5 mb-5">
      <div class="row mt-4">
        <div class="col-md-6">
          Input text:
          <b-form-textarea
            v-model="text"
            :lazy="true"
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
export default {
  // layout: "test-layout",
  computed: {
    output() {
      let text = this.text;
      text = this.renumberNotes(text);
      return text;
    },
  },
  data() {
    return {
      text: "",
    };
  },
  async mounted() {},
  methods: {
    renumberNotes(text) {
      let n = 0
      text = text.replace(/\[\d+\]/g, (match) => {
        n++
        return `[${n}]`
      })
      return text
    },
  },
};
</script>

<style>
</style>