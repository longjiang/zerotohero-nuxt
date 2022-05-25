<template>
  <span>
    <slot></slot>
    <router-link :to="href" :title="title" class="btn btn-small"><i class="fa fa-chevron-right"></i></router-link>
  </span>
</template>

<script>
export default {
  props: {
    href: {
      type: String,
    },
    title: {
      type: String,
    },
  },
  data() {
    return {
      hover: false,
    };
  },
  methods: {
  },
};
</script>

<style lang="scss" scoped>
</style>