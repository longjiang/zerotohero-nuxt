<template>
  <div :class="`z2h-logo z2h-logo-${skin} z2h-logo-${layout}`">
    <router-link :to="to ? to : '/'" class="link-unstyled">
      <div class="z2h-icon-wrapper">
        <img
          src="/img/logo-play-circle-light.png"
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
      <div class="word-mark">
        Language Player
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
    layout: {
      default: "vertical", // or 'horizontal'
    },
    forcePro: {
      default: false,
    },
    to: {
      default: null,
    },
  },
  computed: {
    pro() {
      return this.forcePro || this.$store.state.subscriptions.active;
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
  &.z2h-logo-horizontal a {
    display: flex;
    .z2h-icon-wrapper {
      .z2h-icon {
        height: 2.5rem;
      }
      .rocket-icon {
        display: none;
      }
    }
    .word-mark {
      font-size: 1rem;
      text-align: left;
      padding-left: 1rem;
      width: 6rem;
      line-height: 1.3;
      .pro-icon {
        height: 1rem;
        bottom: 0.1rem;
      }
    }
  }
  &.z2h-logo-vertical a {
    .z2h-icon-wrapper {
      margin-bottom: 1rem;
    }
  }
  .z2h-icon-wrapper {
    position: relative;
    display: inline-block;
    .z2h-icon {
      height: 5.5rem;
    }
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