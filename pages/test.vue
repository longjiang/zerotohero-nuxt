<router>
  {
    path: '/:l1/:l2/test'
  }
</router>
<template>
  <div>Language {{ $hasFeature('youtube') }}</div>
</template>

<script>
export default {
  layout: "test-layout",
  computed: {
    l1() {
      return this.$store.state.settings.l1
    },
    l2() {
      return this.$store.state.settings.l2
    }
  },
  mounted() {
   console.log('test.vue mounted', this.$store.state.settings.l1.name)
  }
};
</script>

<style>
</style>