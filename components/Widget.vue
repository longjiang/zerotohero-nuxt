<template>
  <div
    :class="{
      widget: true,
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
  background: #f6f6f6;
  .widget-title {
    display: block;
    text-align: center;
    font-weight: bold;
    color: #2b3f44b0;
    padding-top: 0.75rem;
    background-image: linear-gradient(180deg, #dcdcdc 0%, #dcdcdc00 100%);
  }
  .widget-body {
    /* background: #f2f2f2; */
    border-radius: 0 0 0.3rem 0.3rem;
  }
  &.widget-dark {
    background: #222;
    color: rgba(255, 255, 255, 0.8);
    .widget-title {
      background-image: linear-gradient(180deg, #ffffff33 0%, #ffffff00 100%);
      color: #ffffffc5;
    }
  }
}
</style>