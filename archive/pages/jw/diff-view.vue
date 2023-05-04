<router>
  {
    path: '/:l1/:l2/diff',
    props: route => ( {a: route.query.a, b: route.query.b })
  }
</router>

<template>
  <div class="container mx-auto mt-10">
    <Diff v-if="a && b" :aUrl="a" :bUrl="b" />
  </div>
</template>

<script>
export default {
  props: ["a", "b"],
  mounted() {
    if (!(this.a && this.b)) {
      this.$router.push({
        name: "jw-diff-view",
        query: {
          a: "https://wol.jw.org/cmn-Hans/wol/b/r23/lp-chs/bi12/1/1&b=https://wol.jw.org/cmn-Hans/wol/b/r23/lp-chs/nwtsty/1/1",
        },
      });
    }
  },
  data() {
    return {};
  },
  methods: {},
};
</script>

<style>
</style>