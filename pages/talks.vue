<router>
  {
    path: '/:l1/:l2/talks',
    props: true,
    meta: {
      skin: 'dark'
    }
  }
</router>
<template>
  <div class="talks">
    <Shows routeType="talks" />
  </div>
</template>

<script>
export default {};
</script>

<style>
</style>