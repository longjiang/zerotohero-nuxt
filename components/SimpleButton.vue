<template>
  <b-button
    size="sm"
    variant="no-bg"
    :class="`skin-${$skin}`"
    :disabled="disabled"
    @click="$emit('click')"
    :title="title"
  >
    <b-spinner small v-if="pending" />
    <template v-else><i :class="iconClass" /> {{ text }}</template>
  </b-button>
</template>

<script>
export default {
  props: {
    iconClass: {
      type: String,
      default: ""
    },
    disabled: {
      type: Boolean,
      default: false
    },
    /**
     * The title attribute for the button.
     */
    title: {
      type: String,
      default: ""
    },
    /**
     * The text to be displayed on the button.
     */
    text: {
      type: String,
      default: ""
    },
    skin: {
      type: String,
      default: ""
    },
    /**
     * Whether the button is in a pending state or not. This is used to display a loading spinner on the button.
     */
    pending: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style scoped lang="scss">
@import "../assets/scss/variables.scss";

.btn:disabled {
  opacity: 0.2;
}

</style>
