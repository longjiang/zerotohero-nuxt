<template>
  <div
    :class="{
      [`zth-nav-${$skin}`]: true,
      'zth-nav-menu-bar': true,
      'zth-nav-secondary': true,
    }"
  >
    <div class="nav-menu-bar">
      <nav v-if="currentParent && currentParent.children">
        <!-- secondary nav items -->
        <div class="secondary-nav-items">
          <router-link
            v-for="(child, index) in currentParent.children.filter(
              (child) => child.show
            )"
            :to="last(child) || child"
            :key="`subnav-item-${currentParent.name}-${
              child.name || child.href
            }-${index}`"
            v-slot="{ href, route, navigate, isActive, isExactActive }"
            custom
          >
            <NavItem
              :mode="mode"
              :to="route.path"
              :item="child"
              :level="2"
              :showIcon="variant === 'side-bar'"
              :active="isExactActive"
              :href="child.href"
            />
          </router-link>
        </div>
      </nav>
    </div>
  </div>
</template>

<script>
import navMixin from "@/lib/mixins/nav-mixin";

export default {
  mixins: [navMixin],
  props: {
    l1: {
      type: Object,
    },
    l2: {
      type: Object,
    },
    variant: {
      default: "menu-bar", // or 'page' (flattened grid), 'side-bar' (on wide screen), or 'bottom-bar' (on small screen)
    },
    skin: {
      default: null, // this overrides user's settings
    },
    mode: {
      type: String,
      default: "pill", // or 'icon'
    },
    showOnly: {
      type: Array,
    },
  },
  data() {
    return {
      hidden: false,
      collapsed: false,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/variables.scss";


.zth-nav-secondary {
  width: 100vw;
  white-space: nowrap;
  text-align: center;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-bottom: 1rem;
  z-index: 19;
  :deep(.nav-item-count) {
    display: none;
  }
}

.zerotohero-wide {
  .zth-nav-secondary {
    width: 100%;
    left: 13rem;
  }

  &.zerotohero-wide-collapsed {
    .zth-nav-secondary {
      width: calc(100vw - 5rem);
      left: 5rem;
    }
  }
}


</style>
