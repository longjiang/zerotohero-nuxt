<template>
  <div class="word-block-quiz word-block-segment">
    <span class="transparent">{{ text }}</span>
  </div>
</template>

<script>
export default {
  props: {
    text: {
      default: "",
    },
  },
};
</script>

<style scoped>
.word-block-quiz {
  border-bottom: 1px solid #ccc;
}
</style>