<template>
  <span
    :class="{
      'main-nav-item': mode !== 'large-icon' && level === 1,
      'secondary-nav-item': mode !== 'large-icon' && level === 2,
      'nav-item-pill': mode === 'pill',
      'nav-item-small-icon': mode === 'small-icon',
      'nav-item-large-icon nav-item-large-icon-dark': mode === 'large-icon',
      'nav-item-active': active,
    }"
  >
    <component
      :is="`${item.href ? 'a' : isDropdown ? 'span' : 'NuxtLink'}`"
      :href="item.href"
      class="link-unstyled"
      :to="isDropdown ? undefined : to"
      :title="item.title"
      :target="item.href ? '_blank' : undefined"
      @click="isDropdown ? showModal() : undefined"
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
        <span class="nav-item-count" v-cloak v-if="item.count">
          {{ $n(item.count) }}
        </span>
        <span class="saved-words-count" v-cloak v-if="badge">
          {{ badge }}
        </span>
        <i class="fa-solid fa-caret-down" v-if="isDropdown"></i>
      </span>
    </component>
    <b-modal ref="dropdownMenuModal" title="BootstrapVue">
      <p class="my-4">Hello from modal!</p>
    </b-modal>
  </span>
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
    count: {
      type: [Number, String], // How many of this item there are (e.g. how many tv shows)
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
    isDropdown() {
      return this.level === 2 && this.item.children;
    },
  },
  methods: {
    showModal() {
      this.$refs["dropdownMenuModal"].show();
    },
  },
};
</script>

<style lang="scss">
.main-nav-item,
.secondary-nav-item {
  cursor: pointer;
}

.nav-item-wrapper {
}

.secondary-nav-item {
  padding-bottom: 0.5rem;
  + .secondary-nav-item {
    margin-left: 1rem;
  }
  &.nav-item-active {
    font-weight: bold;
  }
}

.zth-nav-light {
  .main-nav-item {
    color: #444;
    text-shadow: none;
    &.nav-item-active,
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
    &.nav-item-active,
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
      &.nav-item-active,
      &:hover {
        color: #28a745;
      }
    }
  }
  .secondary-nav-item {
    color: #ccc;
    .nav-item-icon {
      opacity: 0.4;
      margin-right: 0.5rem;
    }
    &.nav-item-active,
    &:hover {
      .nav-item-icon {
        color: #28a745;
        opacity: 1;
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

.nav-item-count {
  font-size: 0.8rem;
  color: #888;
  font-weight: bold;
  &::before {
    content: "(";
  }
  &::after {
    content: ")";
  }
  // background: #53545f;
  // padding: 0.1rem 0.2rem;
  // border-radius: 0.15rem;
  // position: relative;
  // bottom: 0.15rem;
}

.zth-nav-side-bar {
  &.zth-nav-light {
    .main-nav-item {
      color: white;
      text-shadow: black 0 1px 3px;
      &.nav-item-active,
      &:hover {
        color: #444;
        text-shadow: none;
        background: rgba(255, 255, 255, 0.75);
      }
    }
  }
  &.zth-nav-dark {
    .main-nav-item {
      &.nav-item-active,
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
      &.nav-item-active,
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

  &.nav-item-active,
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