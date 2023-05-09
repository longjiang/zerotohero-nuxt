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
        <b-button
          v-if="variant === 'side-bar'"
          variant="unstyled collapse-toggle"
          @click="toggleCollapsed"
        >
          <span v-if="!collapsed">
            <i class="fa-solid fa-caret-left mr-1"></i>
            {{ $t("Collapse Menu") }}
          </span>
          <span v-else><i class="fa-solid fa-caret-right"></i></span>
        </b-button>
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
@import "./Nav/index.scss";
</style>
