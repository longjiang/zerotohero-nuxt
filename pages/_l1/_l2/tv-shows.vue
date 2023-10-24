<template>
  <div class="tv-shows container mb-5">
    <Shows routeType="tv-shows" :showHeroVideo="true" :category="category" :tag="tag" :level="level" :showExtraSearchResults="true" :showLoader="true" />
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