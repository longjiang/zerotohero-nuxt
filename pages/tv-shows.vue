<router>
  {
    path: '/:l1/:l2/tv-shows/:category?/:tag?/:level?',
    props: true,
    meta: {
      skin: 'dark'
    }
  }
</router>
<template>
  <div class="tv-shows container mb-5">
    <Shows routeType="tv-shows" :category="category" :tag="tag" :level="level" :showExtraSearchResults="true" :showLoader="true" />
    <LazyIdenticalLanguages class="mt-3" routeName="tv-shows" />
  </div>
</template>

<script>
export default {
  props: {
    category: String,
    tag: String,
    level: String,
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
  mounted() {
    if (this.category !== 'all' && isNaN(Number(this.category))) {
      this.$router.push({ name: "tv-shows", params: { category: undefined } });
    }
  },
};
</script>

<style>
</style>