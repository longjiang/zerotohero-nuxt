<router>
  {
    path: '/:l1/:l2/audiobooks/:tag?',
    props: true,
    meta: {
      skin: 'dark'
    }
  }
</router>
<template>
  <div class="audiobooks">
    <Shows routeType="audiobooks" :tag="tag" />
  </div>
</template>

<script>
export default {
  props: {
    tag: {
      type: String,
    },
  },
};
</script>

<style>
</style>