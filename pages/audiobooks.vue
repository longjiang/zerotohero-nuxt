<router>
  {
    path: '/:l1/:l2/audiobooks/:category?/:tag?/:level?',
    props: true,
    meta: {
      skin: 'dark'
    }
  }
</router>
<template>
  <div class="audiobooks container">
    <Shows routeType="audiobooks" :category="category" :tag="tag" :level="level" :showExtraSearchResults="true" />
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
      this.$router.push({ name: "audiobooks", params: { category: undefined } });
    }
  },
};
</script>

<style>
</style>