<template>
  <div class="audiobooks container mb-5">
    <Shows routeType="audiobooks" :showHeroVideo="true" :category="category" :tag="tag" :level="level" :showExtraSearchResults="true" :showLoader="true" />
    <LazyIdenticalLanguages class="mt-3" routeName="audiobooks" />
  </div>
</template>

<script>
export default {
  props: {
    category: String,
    tag: String,
    level: String,
  },
  mounted() {
    if (this.category !== 'all' && isNaN(Number(this.category))) {
      this.$router.push({ name: "l1-l2-audiobooks", params: { category: undefined } });
    }
  },
};
</script>

<style>
</style>