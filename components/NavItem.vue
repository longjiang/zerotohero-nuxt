<template>
  <NuxtLink
    :class="{
      'main-nav-item': mode !== 'large-icon' && level === 1,
      'secondary-nav-item': mode !== 'large-icon' && level === 2,
      'nav-item-pill': mode === 'pill',
      'nav-item-small-icon': mode === 'small-icon',
      'feature-card feature-card-dark link-unstyled': mode === 'large-icon',
      tab: mode === 'pill',
      'router-link-active': active,
    }"
    :to="to"
    :title="item.title"
  >
    <div v-if="mode === 'large-icon'" class="feature-card-icon">
      <i
        :class="`${item.icon} bg-gradient-${item.title.length
          .toString()
          .split('')
          .pop()} gradient-text`"
      ></i>
    </div>
    <i v-else :class="`${item.icon}`"></i>
    <span class="nav-item-title">
      {{ $t(item.title, { l2: $t($l2.name) }) }}
      <span class="saved-words-count" v-cloak v-if="badge">
        {{ badge }}
      </span>
    </span>
  </NuxtLink>
</template>

<script>
export default {
  props: {
    mode: {
      default: "pill", // or "icon", "large-icon"
    },
    parent: {
      type: Object,
    },
    item: {
      type: Object,
    },
    badge: {
      type: Number,
    },
    to: [Object, String],
    active: {
      default: false,
    },
    level: {
      default: 1,
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
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
  },
};
</script>

<style lang="scss">
.zth-nav-light {
  .main-nav-item {
    &.nuxt-link-active,
    &:hover {
      color: #444;
      text-shadow: none;
      background: hsla(0deg, 100%, 100%, 0.75);
      border-top: 1px solid rgba(255, 255, 255, 0.5);
      border-left: 1px solid rgba(255, 255, 255, 0.5);
      border-right: 1px solid rgba(255, 255, 255, 0.5);
    }
  }

  .seoncdary-nav-item {
    &.nuxt-link-active,
    &:hover {
      background: #014161c7;
    }
  }
}
.zth-nav-dark {
  .main-nav-item {
    &.nuxt-link-active,
    &:hover {
      color: white;
      background: rgb(50, 50, 50);
      border-top: 1px solid rgba(255, 255, 255, 0.4);
    }
  }

  .secondary-nav-item {
    color: white;

    &.nuxt-link-active,
    &:hover {
      color: white;
      background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.4) 0%,
        rgba(148, 148, 148, 0) 5%,
        rgba(122, 122, 122, 0.4) 75%
      );
    }
  }
}

.nav-menu-bar {
  .main-nav {
    .main-nav-item {
      border-radius: 0.3rem 0.3rem 0 0;
      border-bottom: none;
      margin-right: 0.2rem;
    }
  }
}

.zth-nav-collapsed.zth-nav-side-bar {
  .nav-item-title {
    display: none;
  }
}

.nav-side-bar {
  .main-nav {
    .main-nav-item {
      border-radius: 0.3rem 0 0 0.3rem;
      border-right: 0;
      padding-left: 0.5rem;
      margin: 0.3rem 0;

      i {
        width: 2rem;
        text-align: center;
      }
    }
  }
  .secondary-nav {
    .secondary-nav-item {
      padding: 0.5rem;
      margin: 0.5rem;

      i {
        width: 1.5rem;
        text-align: center;
      }
    }
  }
}

.saved-words-count {
  border-radius: 100%;
  font-size: 0.7rem;
  font-weight: bold;
  display: inline-block;
  line-height: 1.2rem;
  text-align: center;
  position: relative;
  top: -0.1rem;
  position: relative;
  min-width: 1.3rem;
  margin-left: 0.2rem;
  display: inline-block;
  text-shadow: none;
  color: white;
  background: #fd4f1c;
}

.secondary-nav-item {
  padding: 0.5rem 1rem;
  margin: 0.2rem;
  border-radius: 0.3rem;
  color: #666;
  display: inline-block;
  white-space: nowrap;
}

.secondary-nav-item:hover {
  text-decoration: none;
  color: inherit;
  background-color: #f7f7f7;
}

.secondary-nav-item.nuxt-link-active {
  background: #666;
  color: white;
}

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

.feature-card {
  padding: 0.75rem;
  font-size: 1.2em;
  border-radius: 0.5rem;
  box-shadow: 0 10px 30px rgba(68, 75, 134, 0.2);
  display: block;
  text-align: center;
  height: 100%;

  &:hover {
    transform: scale(115%);
    transition: 200ms ease-in-out;
    background-color: hsla(0deg, 100%, 100%, 0.8);
  }

  &.feature-card-light {
    background-color: hsla(0deg, 100%, 100%, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.9);
    color: #333;

    &:hover {
      color: #444;
    }
  }

  &.feature-card-dark {
    background: rgb(69, 69, 69);
    background: radial-gradient(
      circle,
      rgba(69, 69, 69, 1) 0%,
      rgba(0, 0, 0, 1) 100%
    );
    border: 1px solid rgba(255, 255, 255, 0.226);
    border-top: 1px solid rgba(255, 255, 255, 0.5);
    border-bottom: 1px solid rgba(0, 0, 0, 0.5);
    color: rgba(255, 255, 255, 0.8);

    &:hover {
      color: white;
    }
  }

  .feature-card-icon {
    font-size: 2rem;
    opacity: 1;
    display: block;
  }

  .nav-item-title {
    font-size: 0.9em;
    line-height: 1;
    display: block;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>