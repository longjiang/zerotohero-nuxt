<template>
  <div class="talks container mb-5">
    <Shows
      routeType="talks"
      :category="category"
      :tag="tag"
      :level="level"
      :showExtraSearchResults="true"
      :showLoader="true"
      :showHeroVideo="true"
    />
    <LazyIdenticalLanguages class="mt-3" routeName="talks" />
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
      this.$router.push({ name: "l1-l2-talks", params: { category: undefined } });
    }
  },
};
</script>

<style>
</style>