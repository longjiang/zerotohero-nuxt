<router>
  {
    path: '/:l1/:l2/questions',
    props: true
  }
</router>
<template>
  <div class="container main mx-auto mt-10">
    <div class="jw-study-aid-questions">
      <Quiz :articles="2" />
      <p>Refresh the page to see another set.</p>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
  },};
</script>

<style>
</style>