<router>
  {
    path: '/:l1/:l2/publications',
    props: true
  }
</router>
<template>

  <div class="main container mx-auto mt-10">
    <JWArticle :url="`https://wol.jw.org/en/wol/library/r1/lp-e/all-publications`" selector="nav"/>
  </div>
</template>

<script>
export default {
  mounted() {
  },
  computed: {
  },
  methods: {
  }
};
</script>

<style>
</style>