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
  async mounted() {
    console.log(await (await this.$getDictionary()).lookup('你'), 'this')
  }
};
</script>

<style>
</style>