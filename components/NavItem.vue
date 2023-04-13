<template>
  <span
    :class="{
      'main-nav-item': variant !== 'page' && level === 1,
      'secondary-nav-item': variant !== 'page' && level === 2,
      'nav-item-menu-bar': variant === 'menu-bar',
      'nav-item-bottom-bar': variant === 'bottom-bar',
      'nav-item-page nav-item-page-dark': variant === 'page',
      'nav-item-active': active,
    }"
    @click="wrapperClick"
  >
    <component
      :is="`${item.href ? 'a' : isDropdown ? 'span' : 'NuxtLink'}`"
      :href="item.href"
      :to="isDropdown ? undefined : to"
      :title="item.title"
      :target="item.href ? '_blank' : undefined"
      @click="isDropdown ? showModal() : undefined"
      class="link-unstyled nav-item-link"
      ref="link"
    >
      <div
        v-if="['page', 'bottom-bar'].includes(variant)"
        class="icon-wrapper"
      >
        <i
          v-if="showIcon"
          :class="`nav-item-icon ${item.icon} ${
            variant === 'page' ? gradientClasses : ''
          }`"
        ></i>
      </div>
      <i v-else-if="showIcon" :class="`nav-item-icon mr-1 ${item.icon}`"></i>
      <span class="nav-item-title">
        {{
          $t(isDropdown ? selfOrCurrentChild.title : item.title, {
            l2: $t($l2.name),
          })
        }}
        <i class="fas fa-pro" v-if="item.title === 'Me' && pro"></i>
        <span class="nav-item-count" v-cloak v-if="item.count">{{ $n(item.count) }}</span>
        <span class="saved-words-count" v-cloak v-if="item.badge">
          {{ item.badge }}
        </span>
        <i class="fa-solid fa-caret-down" v-if="isDropdown"></i>
      </span>
    </component>
    <b-modal
      ref="dropdownMenuModal"
      size="lg"
      centered
      hide-footer
      modal-class="safe-padding-top mt-4"
      body-class="dropdown-menu-modal-wrapper"
      :title="$t(this.item.title)"
      v-if="isDropdown"
    >
      <div class="row">
        <div
          v-for="(child, index) in item.children.filter((c) => c.show)"
          :key="`dropdown-menu-item-${index}`"
          class="mb-1 col-6 col-lg-4"
        >
          <router-link
            :to="
              child.path
                ? child.path
                : { name: child.name, params: child.params }
            "
            class="link-unstyled dropdown-nav-child"
          >
            <i :class="`nav-item-icon ${child.icon} mr-1`"></i>
            {{ $t(child.title) }} <span v-if="child.count" class="nav-item-count">({{ child.count }})</span>
            <span class="saved-words-count" v-cloak v-if="child.badge">
              {{ child.badge }}
            </span>
          </router-link>
        </div>
      </div>
    </b-modal>
  </span>
</template>

<script>
export default {
  props: {
    variant: {
      default: "menu-bar", // or "bottom-bar" (for bottom nav), "page" (for "page" nav)
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
    gradientClasses() {
      return `bg-gradient-${this.item.title.length
        .toString()
        .split("")
        .pop()} gradient-text`;
    },
    isDropdown() {
      return this.level === 2 && this.item.children;
    },
    selfOrCurrentChild() {
      let item = this.item;
      if (item.children) {
        let currentChild = item.children.find((c) => {
          if (!c.show) return false;
          if (c.path) return this.$route.path.includes(c.path);
          if (c.name === this.$route.name) {
            if (c.params) {
              for (let key in c.params) {
                if (this.$route.params?.[key] != c.params[key]) {
                  return false;
                }
              }
              return true;
            } else return true;
          }
        });
        return currentChild ? currentChild : item;
      }
    },
    pro() {
      return this.forcePro || this.$store.state.subscriptions.active;
    },
  },
  watch: {
    $route() {
      this.$refs["dropdownMenuModal"]?.hide();
    },
  },
  methods: {
    wrapperClick() {
      let linkElement =
        this.$refs["link"]?.$el || this.$el.querySelector(".nav-item-link");
      if (linkElement) linkElement.click();
    },
    showModal() {
      this.$refs["dropdownMenuModal"]?.show();
    },
  },
};
</script>

<style lang="scss">
.nav-item-bottom-bar {
  .nav-item-icon {
    width: 1.25rem;
    text-align: center;
  }
}

.main-nav-item,
.secondary-nav-item {
  cursor: pointer;
}

.secondary-nav-item {
  padding-bottom: 0.5rem;
  + .secondary-nav-item {
    margin-left: 0.5rem;
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

  .secondary-nav-item a {
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
      border-radius: 0.3rem;
      border-bottom: none;
      margin-right: 0.2rem;
      &.nav-item-bottom-bar {
        padding: 0.5rem;
      }
      &.nav-item-active,
      &:hover {
        color: #28a745;
      }
      .nav-item-count {
        display: none;
      }
    }
  }
  .secondary-nav-item {
    font-size: 0.9rem;
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

.nav-item-bottom-bar {
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
      border-radius: 0.3rem;
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

.nav-item-page {
  padding: 0.75rem;
  font-size: 1.2em;
  border-radius: 0.5rem;
  box-shadow: 0 10px 30px rgba(68, 75, 134, 0.2);
  display: block;
  text-align: center;
  height: 100%;
  cursor: pointer;
  .nav-item-count {
    display: none;
  }

  &:hover {
    transform: scale(115%);
    transition: 200ms ease-in-out;
    background-color: hsla(0deg, 100%, 100%, 0.8);
  }

  &.nav-item-page-light {
    background-color: hsla(0deg, 100%, 100%, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.9);
    color: #333;

    &:hover {
      color: #444;
    }
  }

  &.nav-item-page-dark {
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