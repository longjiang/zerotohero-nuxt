<router>
  {
    path: '/:l1/:l2/publications',
    props: true
  }
</router>
<template>

  <div class="container mx-auto mt-10">
    <JWArticle :url="`https://wol.jw.org/en/wol/library/r1/lp-e/all-publications`" selector="nav"/>
  </div>
</template>

<script>
export default {
  mounted() {
  },
  computed: {
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
  },
  methods: {
  }
};
</script>

<style>
</style>