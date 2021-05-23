<template>
  <div id="loader" v-if="loading" class="d-inline-block text-center">
    <div class="heartbeat-loader mb-4"></div>
    <div v-html="message"></div>
  </div>
</template>

<script>
export default {
  props: {
    sticky: {
      default: false
    },
    message: {
      default: 'Loading'
    }
  },
  data() {
    return {
      loading: true
    }
  },
  async mounted() {
    await this.$getDictionary()
    this.loading = false
  }
}
</script>
<style></style>
