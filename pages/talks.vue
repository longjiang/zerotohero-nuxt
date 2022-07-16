<router>
  {
    path: '/:l1/:l2/talks/:category?/:tag?/:level?',
    props: true,
    meta: {
      skin: 'dark'
    }
  }
</router>
<template>
  <div class="talks container">
    <Shows
      routeType="talks"
      :category="category"
      :tag="tag"
      :level="level"
      :showExtraSearchResults="true"
    />
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
      this.$router.push({ name: "talks", params: { category: undefined } });
    }
  },
};
</script>

<style>
</style>