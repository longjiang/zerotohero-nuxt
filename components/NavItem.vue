<template>
  <NuxtLink
    :class="{
      'main-nav-item': true,
      tab: variant === 'menu-bar',
      'd-block': variant === 'side-bar',
      'router-link-active': active,
    }"
    :to="to"
    :title="item.title"
  >
    <i :class="`${item.icon}`"></i>
    {{ $t(item.title, { l2: $t($l2.name) }) }}
    <span class="saved-words-count" v-cloak v-if="badgeCount">
      {{ badgeCount }}
    </span>
  </NuxtLink>
</template>

<script>
export default {
  props: {
    variant: {
      default: "menu-bar",
    },
    parent: {
      type: Object,
    },
    item: {
      type: Object,
    },
    badgeCount: {
      type: Number,
    },
    to: {
      type: Object
    },
    active: {
      default: false
    }
  },
  computed: {
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
  },
};
</script>

<style lang="scss" scoped>
  .main-nav-item {
    padding: 0.5rem 1rem;
    color: white;
    display: inline-block;
    border: none;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 1);
    border: 1px solid rgba(255, 255, 255, 0);
    border-radius: 0.3rem;
    white-space: nowrap;

    &.nuxt-link-active,
    &:hover {
      text-decoration: none;
    }
  }
</style>