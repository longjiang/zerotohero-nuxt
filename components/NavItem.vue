<template>
  <component
    :is="`${item.href ? 'a' : 'NuxtLink'}`"
    :class="{
      'main-nav-item': mode !== 'large-icon' && level === 1,
      'secondary-nav-item': mode !== 'large-icon' && level === 2,
      'nav-item-pill': mode === 'pill',
      'nav-item-small-icon': mode === 'small-icon',
      'nav-item-large-icon nav-item-large-icon-dark link-unstyled':
        mode === 'large-icon',
      'router-link-active': active,
    }"
    :href="item.href"
    :to="to"
    :title="item.title"
    :target="item.href ? '_blank' : undefined"
  >
    <div
      v-if="['large-icon', 'small-icon'].includes(mode)"
      class="icon-wrapper"
    >
      <i
        v-if="showIcon"
        :class="`nav-item-icon ${item.icon} ${
          mode === 'large-icon' ? gradientClasses : ''
        }`"
      ></i>
    </div>
    <i v-else-if="showIcon" :class="`nav-item-icon mr-1 ${item.icon}`"></i>
    <span class="nav-item-title">
      {{ $t(item.title, { l2: $t($l2.name) }) }}
      <span class="saved-words-count" v-cloak v-if="badge">
        {{ badge }}
      </span>
    </span>
  </component>
</template>

<script>
export default {
  props: {
    mode: {
      default: "pill", // or "icon", "large-icon"
    },
    showIcon: {
      default: true,
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
    gradientClasses() {
      return `bg-gradient-${this.item.title.length
        .toString()
        .split("")
        .pop()} gradient-text`;
    },
  },
};
</script>

<style lang="scss">
.main-nav-item,
.secondary-nav-item {
  cursor: pointer;
}

.secondary-nav-item {
  padding-bottom: 0.5rem;
  + .secondary-nav-item {
    margin-left: 1rem;
  }
  &.nuxt-link-active {
    font-weight: bold;
  }
}

.zth-nav-light {
  .main-nav-item {
    color: #444;
    text-shadow: none;
    &.nuxt-link-active,
    &:hover {
      color: #28a745;
      background: hsla(0deg, 100%, 100%, 0.75);
    }
  }

  a.secondary-nav-item {
    color: #444;
  }
}

.zth-nav-dark {
  .main-nav-item {
    color: white;
  }
  .secondary-nav-item {
    color: white;
    &.nuxt-link-active,
    &:hover {
      color: white;
    }
  }
}
.nav-menu-bar {
  .main-nav {
    .main-nav-item {
      border-radius: 0.3rem 0.3rem 0 0;
      border-bottom: none;
      margin-right: 0.2rem;
      &.nav-item-small-icon {
        padding: 0.5rem;
      }
      &.nuxt-link-active,
      &:hover {
        color: #28a745;
      }
    }
  }
  .secondary-nav-item {
    color: #ccc;
    .nav-item-icon {
      color: #28a74566;
      margin-right: 0.5rem;
    }
    &.nuxt-link-active,
    &:hover {
      .nav-item-icon {
        color: #28a745;
      }
      border-bottom: 0.4rem solid #28a745cc;
    }
  }
}

.zth-nav-collapsed.zth-nav-side-bar {
  .nav-item-title {
    display: none;
  }
}

.nav-item-small-icon {
  .nav-item-title {
    font-size: 0.7rem;
  }
  .nav-item-icon {
    font-size: 1.2rem;
  }
}

.zth-nav-side-bar {
  &.zth-nav-light {
    .main-nav-item {
      color: white;
      text-shadow: black 0 1px 3px;
      &.nuxt-link-active,
      &:hover {
        color: #444;
        text-shadow: none;
        background: rgba(255, 255, 255, 0.75);
      }
    }
  }
  &.zth-nav-dark {
    .main-nav-item {
      &.nuxt-link-active,
      &:hover {
        background: #323232;
      }
    }
  }
  .main-nav {
    .main-nav-item {
      border-radius: 0.3rem 0 0 0.3rem;
      border-right: 0;
      padding-left: 0.5rem;
      margin: 0.3rem 0;
      display: block;
      i {
        width: 2rem;
        text-align: center;
      }
    }
  }
  .secondary-nav {
    .secondary-nav-item {
      padding: 0.5rem;
      margin: 0.5rem 0 0.5rem 0.5rem;
      display: block;
      i {
        width: 1.5rem;
        text-align: center;
      }
      &.nuxt-link-active,
      &:hover {
        border-right: 0.4rem solid #28a745cc;
      }
    }
  }
}

.saved-words-count {
  border-radius: 100%;
  font-size: 0.7em;
  font-weight: bold;
  display: inline-block;

  text-align: center;
  position: relative;
  top: -0.1rem;
  position: relative;
  line-height: 1.7;
  min-width: 1.7em;
  height: 1.7em;
  margin-left: 0.2em;
  display: inline-block;
  text-shadow: none;
  color: white;
  background: #fd4f1c;
}

.secondary-nav-item:hover {
  text-decoration: none;
}

.main-nav-item {
  padding: 0.5rem 1rem;
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

.nav-item-large-icon {
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

  &.nav-item-large-icon-light {
    background-color: hsla(0deg, 100%, 100%, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.9);
    color: #333;

    &:hover {
      color: #444;
    }
  }

  &.nav-item-large-icon-dark {
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

  .icon-wrapper {
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