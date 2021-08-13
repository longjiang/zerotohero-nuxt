<router>
  {
    path: '/:l1/:l2/tv-shows',
    props: true
  }
</router>
<template>
  <Shows routeType="tv-shows" />
</template>

<script>
export default {
  mounted() {
    this.$nuxt.$emit('skin', 'dark')
  }
}
</script>

<style>

</style>