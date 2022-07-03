<router>
  {
    path: '/:l1/:l2/talks/:tag?/:level?',
    props: true,
    meta: {
      skin: 'dark'
    }
  }
</router>
<template>
  <div class="talks container">
    <Shows routeType="talks" :tag="tag" :level="level" />
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