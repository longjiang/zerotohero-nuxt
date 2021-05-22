<router>
  {
    path: '/:l1/:l2/test'
  }
</router>
<template>
  <div>Language {{  }}</div>
</template>

<script>
export default {
  layout: "test-layout",
  computed: {
    l1() {
      return this.$store.state.settings.l1
    },
    l2() {
      return this.$store.state.settings.l2
    }
  },
  async created() {
    let dictionary = await this.$getDictionary()
    console.log(await (await dictionary).lookup('你'), 'dictionary.lookup')
  },
  async mounted() {
    let dictionary = await this.$getDictionary()
    console.log(await (await dictionary).lookup('你'), 'dictionary.lookup')
  }
};
</script>

<style>
</style>