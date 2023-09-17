<template>
  <b-button
    size="sm"
    variant="ghost-dark-no-bg"
    :disabled="disabled"
    @click="$emit('click')"
    :title="title"
  >
    <i :class="iconClass" />
  </b-button>
</template>

<script>
export default {
  props: ['iconClass', 'disabled', 'title'],
};
</script>
