<router>
  {
    path: '/:l1/:l2/test'
  }
</router>
<template>
  <div>
    <div v-if="showTestEntry">
      {{ entry }}

      <DictionaryEntry v-if="entry" :entry="entry" :key="entry.id" />
    </div>
    <div class="main">

    </div>
  </div>
</template>

<script>
export default {
  // layout: "test-layout",
  computed: {
    l1() {
      return this.$store.state.settings.l1;
    },
    l2() {
      return this.$store.state.settings.l2;
    },
  },
  data() {
    return {
      showTestEntry: false,
      entry: undefined,
    };
  },
  methods: {
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