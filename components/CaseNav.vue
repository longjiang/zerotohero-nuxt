<template>
  <div class="type-nav">
    <router-link
      class="type-nav-item"
      v-for="type in types"
      :to="`/${$l1.code}/${$l2.code}/cases/nouns/${type.replace(' ', '_')}`"
      :key="`case-nav-${type}`"
    >
      {{ type.charAt(0).toUpperCase() + type.substr(1) }}
    </router-link>
  </div>
</template>

<script>
export default {
  props: {
    types: {
      type: Array,
    },
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
  },
  data() {
    return {};
  },
};
</script>

<style>
.type-nav-item {
  padding: 0.5rem;
  cursor: pointer;
  font-weight: bold;
  color: #826b62;
  display: block;
}

.type-nav-item.router-link-exact-active {
  background: #826b61;
  cursor: inherit;
  color: white;
  border-radius: 0.3rem;
}
</style>
