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
  <Shows routeType="talks" />
</template>

<script>
export default {

}
</script>

<style>

</style>