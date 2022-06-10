<template>
  <span>
    <slot></slot>
    &nbsp;
    <router-link
      v-if="href && !href.endsWith('undefined')"
      :to="{ name: 'reader', params: { method: 'html-url', arg: absoluteURL(alt, href) } }"
      :title="title"
      class="btn btn-small"
    >
      <i class="fa fa-chevron-right"></i>
    </router-link>
  </span>
</template>

<script>
import { absoluteURL } from "@/lib/utils/url";

export default {
  props: {
    href: {
      type: String,
    },
    title: {
      type: String,
    },
    alt: { // the base url
      type: String,
      default: "",
    },
  },
  data() {
    return {
      hover: false,
    };
  },
  mounted() {},
  methods: {
    absoluteURL(...args) {
      return absoluteURL(...args)
    }
  },
};
</script>

<style lang="scss" scoped>
</style>