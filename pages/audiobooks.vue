<router>
  {
    path: '/:l1/:l2/audiobooks/:tag?/:level?',
    props: true,
    meta: {
      skin: 'dark'
    }
  }
</router>
<template>
  <div class="audiobooks container">
    <Shows routeType="audiobooks" :tag="tag" :level="level" :showExtraSearchResults="true" />
  </div>
</template>

<script>
export default {
  props: {
    tag: String,
    level: String,
  },
};
</script>

<style>
</style>