<router>
  {
    path: '/:l1/:l2/test'
  }
</router>
<template>
  <div>
    {{ entry }}

    <DictionaryEntry v-if="entry" :entry="entry" :key="entry.id" />
  </div>
</template>

<script>
export default {
  layout: "test-layout",
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
      entry: undefined,
    };
  },
  async created() {
    let dictionary = await this.$getDictionary();
    console.log(await (await dictionary).lookup("你"), "dictionary.lookup");
  },
  async mounted() {
    let dictionary = await this.$getDictionary();
    console.log(await (await dictionary).random(), "dictionary.random()");
  },
  async fetch() {
    if (true) {
      let dictionary = await this.$getDictionary();
      this.entry = await (await dictionary).lookup("你好");
    }
  },
};
</script>

<style>
</style>