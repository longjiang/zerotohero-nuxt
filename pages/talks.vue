<router>
  {
    path: '/:l1/:l2/talks/:tag?',
    props: true,
    meta: {
      skin: 'dark'
    }
  }
</router>
<template>
  <div class="talks">
    <Shows routeType="talks" :tag="tag" />
  </div>
</template>

<script>
export default {
  props: {
    tag: {
      type: String
    }
  }
};
</script>

<style>
</style>