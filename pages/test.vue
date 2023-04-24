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
          <b-button @click="testTokenizer">Tokenize</b-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    async testTokenizer() {
      const tokenizer = this.$getTokenizer();
      console.log('testing tokenizer', {tokenizer});
      if (tokenizer.tokenize) {
        let tokens = await tokenizer.tokenize("Hello, world!")
        console.log({tokens});
      }   
    },
    detectCircularReferences(obj, path = []) {
      if (typeof obj !== "object" || obj === null) {
        return;
      }

      if (path.includes(obj)) {
        console.log("Circular reference detected:", path);
        return;
      }

      path.push(obj);

      for (const key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) {
          this.detectCircularReferences(obj[key], path.slice());
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
