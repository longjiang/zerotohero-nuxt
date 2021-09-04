<router>
  {
    path: '/:l1/:l2/tv-shows',
    props: true,
    meta: {
      skin: 'dark'
    }
  }
</router>
<template>
  <div class="tv-shows">
    <Shows routeType="tv-shows" />
  </div>
</template>

<script>
export default {};
</script>

<style>
</style>