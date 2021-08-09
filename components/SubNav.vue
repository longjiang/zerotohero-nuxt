<template>
  <nav class="secondary-menu text-center pt-3" style="min-height: 61px">
    <template v-if="parent && parent.children">
      <NuxtLink
        class="secondary-menu-item"
        v-for="(child, index) in parent.children.filter((child) => child.show)"
        :key="`subnav-${child.name}-${index}`"
        :to="last(child) || child"
      >
        <i :class="child.icon"></i>
        {{ $t(child.title, { l2: $t($l2.name) }) }}
        <span
          class="saved-words-count"
          v-cloak
          v-if="child.name === 'saved-words'"
        >
          {{ savedWordsCount() }}
        </span>
      </NuxtLink>
    </template>
  </nav>
</template>

<script>
export default {
  props: {
    parent: {
      type: Object
    }
  }
};
</script>

<style>
</style>