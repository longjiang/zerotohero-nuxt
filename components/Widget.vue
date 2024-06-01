<template>
  <div
    :class="{
      'widget': true,
      'widget-dark': $skin === 'dark',
      'widget-light': $skin === 'light',
    }"
  >
    <div class="widget-title">
      <slot name="title"></slot>
    </div>
    <div :class="{ 'widget-body': true, 'p-3': withPadding }">
      <slot name="body"></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    skin: {
      default: null,
    },
    withPadding: {
      default: true
    }
  },
};
</script>

<style lang="scss" scoped>
@import "../assets/scss/variables.scss";

.widget {
  border-radius: 0.3rem;
  overflow: hidden;
  .widget-title {
    display: block;
    text-align: center;
    font-weight: bold;
    padding-top: 0.75rem;
  }
  .widget-body {
    /* background: #f2f2f2; */
    border-radius: 0 0 0.3rem 0.3rem;
  }
  &.widget-dark {
    background-color: $bg-color-dark-3;
  }
  &.widget-light {
    background-color: $bg-color-light-3;
  }
}
</style>