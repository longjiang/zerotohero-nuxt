<router>
  {
    path: '/:l1/:l2/audiobooks',
    props: true,
    meta: {
      skin: 'dark'
    }
  }
</router>
<template>
  <div class="audiobooks">
    <Shows routeType="audiobooks" />
  </div>
</template>

<script>
export default {};
</script>

<style>
</style>