<router>
  {
    path: '/:l1/:l2/timeline',
  }
</router>
<template>
  <div class="container mx-auto mt-10">
    <div id="jw-study-aid-timeline">
      <Timeline />
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