<router>
  {
    path: '/:l1/:l2/byov',
    props: true,
    meta: {
      skin: 'dark',
      // collapseNav: true
    },
  }
</router>
<template>
  <div class="youtube-view-page">
    <VideoViewComp />
  </div>
</template>

<script>
export default {
  props: {
  },
};
</script>

<style>
</style>