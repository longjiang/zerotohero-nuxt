<template>
  <div>
    <div v-if="word">{{ word }}</div>
  </div>
</template>

<script>
export default {
  props: {
    word: {
      type: Object
    }
  }

}
</script>

<style>

</style>