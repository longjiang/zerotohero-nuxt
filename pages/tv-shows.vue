<router>
  {
    path: '/:l1/:l2/tv-shows/:tag?',
    props: true,
    meta: {
      skin: 'dark'
    }
  }
</router>
<template>
  <div class="tv-shows">
    <Shows routeType="tv-shows" :tag="tag" />
  </div>
</template>

<script>
export default {
  props: {
    tag: {
      type: String
    }
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
};
</script>

<style>
</style>