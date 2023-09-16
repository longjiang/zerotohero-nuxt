<template>
  <div :class="navClasses">
    <div
      :class="{
        'nav-menu-bar': variant === 'menu-bar',
        'nav-side-bar': variant === 'side-bar',
        'nav-page': variant === 'page',
        'nav-bottom-bar': variant === 'bottom-bar',
      }"
    >
      <nav class="main-nav">
        <Logo
          layout="horizontal"
          v-if="variant === 'side-bar'"
          style="margin-left: 1.25rem; margin-top: 2.5rem"
          :skin="$skin"
        />
        <div :class="{ 'main-nav-items': true }">
          <template
            v-for="(item, index) in menu.filter(
              (item) => item.show && to(item)
            )"
          >
            <!-- main nav items -->
            <NavItem
              :to="to(item)"
              :item="item"
              :level="1"
              :variant="variant"
              :key="`nav-${index}`"
              :active="
                currentParent && currentParent === item && item.name !== 'index'
              "
            />
          </template>
        </div>
        <div class="nav-side-bar-end" v-if="variant === 'side-bar'">
          <VersionInfo class="mb-2 small" />
          <b-button
            variant="unstyled collapse-toggle"
            @click="toggleCollapsed"
          >
            <span v-if="!collapsed">
              <i class="fa-solid fa-caret-left mr-1"></i>
              {{ $t("Collapse Menu") }}
            </span>
            <span v-else><i class="fa-solid fa-caret-right"></i></span>
          </b-button>
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
    showOnlyChildren: {
      type: Array,
    },
    showLogo: {
      type: Boolean,
      default: true,
    },
    showHeader: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      hidden: false,
      collapsed: false,
    };
  },
  mounted() {
    if (this.$route.meta.collapseNav)
      this.collapsed = this.$route.meta.collapseNav;
    this.$emit("collapsed", this.collapsed);
    this.bindAutoHideBottomBarEvent();
  },
  beforeDestroy() {
    // you may call unsubscribe to stop the subscription
    this.unsubscribe();
  },
  watch: {
    $route() {
      if (this.$route.meta.collapseNav)
        this.collapsed = this.$route.meta.collapseNav;
      else this.collapsed = false;
      this.hidden = false;
    },
    collapsed() {
      this.$emit("collapsed", this.collapsed);
    },
  },
  computed: {
    navClasses() {
      return {
        "zth-nav-main": true,
        [`zth-nav-${this.$skin}`]: true,
        "zth-nav-side-bar": this.variant === "side-bar",
        "zth-nav-bottom": this.variant === "bottom-bar",
        "zth-nav-collapsed": this.collapsed,
        "zth-nav-bottom-hidden": this.hidden,
        "draggable-region": this.variant === "side-bar",
      };
    },
  },
  methods: {
    /* When the user scrolls down, hide the navbar. When the user scrolls up, show the navbar */
    /* https://www.w3schools.com/howto/howto_js_navbar_hide_scroll.asp */
    bindAutoHideBottomBarEvent() {
      if (this.variant === "bottom-bar" && this.autoHide) {
        var prevScrollpos = window.pageYOffset;
        window.onscroll = () => {
          if (this.variant === "bottom-bar") {
            var currentScrollPos = window.pageYOffset;
            if (prevScrollpos > currentScrollPos + 5) {
              this.hidden = false;
            } else if (prevScrollpos < currentScrollPos - 5) {
              this.hidden = true;
            }
            prevScrollpos = currentScrollPos;
          }
        };
      }
    },
    toggleCollapsed() {
      this.collapsed = !this.collapsed;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/variables.scss";


.nav-side-bar-end {
  margin-left: 1rem;
  width: calc(100% - 2rem);
  position: absolute;
  bottom: 1rem;
  .collapse-toggle {
    width: 100%;
    text-align: center;
  }
}

.zth-nav-dark {
  &.zth-nav-side-bar {
    background-color: $bg-color-dark-2;
  }
  .collapse-toggle {
    color: white;
    background: rgb(255 255 255 / 20%);
    text-shadow: rgba(0, 0, 0, 0.465) 0 1px 3px;
  }
  &.zth-nav-bottom {
    background: $bg-color-dark-2;
    border-top: 1px solid #666;
  }
}
.zth-nav-light {
  &.zth-nav-side-bar {
    background-color: $bg-color-light-2;
  }
  .collapse-toggle {
    background: white;
  }
  &.zth-nav-bottom {
    background: $bg-color-light-2;
    border-top: rgb(222, 222, 222);
  }
}

.zth-nav-bottom {
  padding-bottom: calc(env(safe-area-inset-bottom) + 0.25rem);
  transition: 0.2s all ease-in-out;
  &.zth-nav-bottom-hidden {
    bottom: -5rem;
    padding-bottom: 0;
  }
  .main-nav-items {
    padding: 0.5rem 0.5rem;
    white-space: nowrap;
    width: 100%;
    overflow: auto;
    display: flex;
    justify-content: space-around;
  }
}


.nav-side-bar {
  display: flex;
  flex-wrap: nowrap;
  top: 0;
  left: 0;
  height: 100%;

  .main-nav {
    width: 100%;

    margin: 0;
    position: relative;


    .main-nav-items {
      padding: 1rem;
    }

    .end-nav {
      position: absolute;
      width: calc(100% - 1rem);
      bottom: 1rem;
      left: 1rem;

      .icon-description {
        color: white;
        font-size: 0.7rem;
        padding: 0 1rem 1rem 1rem;
        z-index: -9;
        margin-left: -1rem;
        margin-bottom: -1rem;
        text-shadow: 2px 2px 15px black;

        .logo-circle {
          width: 44px;
          height: 44px;
          -o-object-fit: cover;
          object-fit: cover;
          border-radius: 0.3rem;
          margin-top: 0.2rem;
          margin-bottom: -2px;
          margin-right: 8px;
          display: block;
          box-shadow: 2px 2px 15px rgb(0 0 0 / 50%);
          float: left;
        }
      }
    }

    .end-nav-item {
      border-radius: 0.25rem;
      background-color: rgba(29, 29, 29, 0.5);
      padding: 0.5rem 1rem;
      margin-top: 0.5rem;
      margin-right: 1rem;
      text-align: left;
      display: block;
      color: white;
      cursor: pointer;
      font-size: 0.85em;
    }
  }
}


.main-nav {
  margin: 0 auto;
  width: 100%;
  overflow: hidden;
  display: block;
}

.logo {
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.5));
}

.nav-bottom-bar {
  text-align: center;
  .nav-item-bottom-bar {
    padding: 0.5rem;
  }
}

.nav-side-bar {
  background-size: cover;
  .main-nav {
    backdrop-filter: blur(20px);
  }
}



.zerotohero-wide {
  .zth-main-nav-wrapper {
    &:not(.zth-nav-collapsed) {
      width: 13rem;
    }    
    &.zth-nav-collapsed {
      width: 5rem;
      :deep(.word-mark) {
        display: none;
      }
    }
  }
}
</style>
