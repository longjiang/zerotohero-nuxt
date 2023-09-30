<template>
  <b-button
    size="sm"
    variant="ghost-dark-no-bg"
    :disabled="disabled"
    @click="$emit('click')"
    :title="title"
  >
    <i :class="iconClass" /> {{ text }}
  </b-button>
</template>

<script>
export default {
  props: ['iconClass', 'disabled', 'title', 'text'],
};
</script>
