<template>
  <b-button
    size="sm"
    variant="no-bg"
    :class="`skin-${$skin}`"
    :disabled="disabled"
    @click="$emit('click')"
    :title="title"
  >
    <i :class="iconClass" /> {{ text }}
  </b-button>
</template>

<script>
export default {
  props: ["iconClass", "disabled", "title", "text", "skin"],
};
</script>

<style scoped lang="scss">
@import "~@/assets/scss/variables.scss";

.btn:disabled {
  opacity: 0.2;
}

</style>
