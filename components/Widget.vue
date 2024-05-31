<template>
  <div
    :class="{
      'bg-accent widget': true,
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

<style lang="scss">
.widget {
  border-radius: 0.3rem;
  overflow: hidden;
  .widget-title {
    display: block;
    text-align: center;
    font-weight: bold;
    color: #2b3f44b0;
    padding-top: 0.75rem;
  }
  .widget-body {
    /* background: #f2f2f2; */
    border-radius: 0 0 0.3rem 0.3rem;
  }
  &.widget-dark {
    color: rgba(255, 255, 255, 0.8);
    .widget-title {
      color: #ffffffc5;
    }
  }
}
</style>