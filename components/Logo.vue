<template>
  <div :class="`z2h-logo z2h-logo-${skin}`" style="font-size: 2rem">
    <router-link to="/" class="link-unstyled">
      <img
        src="/img/czh-icon.png"
        style="height: 5.5rem; margin-bottom: 1rem"
        data-not-lazy
      />
      <br />
      <b>Zero to Hero</b>
    </router-link>
  </div>
</template>

<script>
export default {
  props: {
    skin: {
      default: "dark", // or light
    },
  },
};
</script>

<style lang="scss" scoped>
.z2h-logo {
  text-align: center;
  display: block;
  &.z2h-logo-light {
    color: #444;
  }
  &.z2h-logo-dark {
    color: white;
    text-shadow: 0 0 20px rgba(0, 0, 0, 0.7);
    -webkit-filter: drop-shadow(0 0 20px rgba(0, 0, 0, 0.7));
    filter: drop-shadow(0 0 20px rgba(0, 0, 0, 0.7));
  }
}
</style>