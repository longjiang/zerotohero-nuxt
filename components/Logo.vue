<template>
  <div :class="`z2h-logo z2h-logo-${skin}`">
    <router-link to="/" class="link-unstyled">
      <div class="z2h-icon-wrapper">
        <img
          src="/img/logo-play-circle-light.png"
          style="height: 5.5rem; margin-bottom: 1rem"
          class="z2h-icon"
          data-not-lazy
        />
        <client-only>
          <img
            v-if="pro"
            src="/img/icon-rocket.png"
            data-not-lazy
            class="rocket-icon"
          />
        </client-only>
      </div>
      <div class="mt-3" v-if="pro" />
      <div v-else />
      <div class="word-mark">
        Zero to Hero
        <client-only>
          <img
            v-if="pro"
            src="/img/icon-pro.png"
            data-not-lazy
            class="pro-icon"
          />
        </client-only>
      </div>
    </router-link>
  </div>
</template>

<script>
export default {
  props: {
    skin: {
      default: "dark", // or light
    },
    forcePro: {
      default: false,
    },
  },
  computed: {
    pro() {
      if (this.forcePro) return true;
      return [1, 4].includes(Number(this.$auth.user?.role)) ? true : false;
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
  .z2h-icon-wrapper {
    position: relative;
    display: inline-block;
    .rocket-icon {
      height: 3.6rem;
      width: auto;
      position: absolute;
      bottom: 0;
      right: -1rem;
    }
  }
  .pro-icon {
    display: inline-block;
    height: 2rem;
    position: relative;
    bottom: 0.5rem;
  }
  .word-mark {
    font-size: 1.5rem;
    font-weight: bold;
  }
}
</style>