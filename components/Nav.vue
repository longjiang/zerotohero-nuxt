<template>
  <div
    :class="{
      [`zth-nav-${$skin}`]: true,
      'zth-nav-menu-bar': variant === 'menu-bar',
      'zth-nav-side-bar': variant === 'side-bar',
      'zth-nav-bottom': variant === 'bottom-bar',
      'zth-nav-main': (variant === level) === 'main',
      'zth-nav-secondary': level === 'secondary',
      'zth-nav-page': variant === 'page',
      'zth-nav-collapsed': collapsed,
      'zth-nav-bottom-hidden': hidden,
      'draggable-region': variant === 'side-bar',
    }"
  >
    <div
      :class="{
        'nav-menu-bar': variant === 'menu-bar',
        'nav-side-bar': variant === 'side-bar',
        'nav-page': variant === 'page',
        'nav-bottom-bar': variant === 'bottom-bar',
      }"
    >
      <template v-if="variant !== 'page'">
        <nav v-if="level === 'main'" :class="{ 'main-nav': true }">
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
                  currentParent &&
                  currentParent === item &&
                  item.name !== 'index'
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
        <nav
          v-else-if="
            level === 'secondary' && currentParent && currentParent.children
          "
        >
          <!-- secondary nav items -->
          <div class="secondary-nav-items">
            <router-link
              v-for="(child, index) in currentParent.children.filter(
                (child) => child.show
              )"
              :to="last(child) || child"
              :key="`subnav-item-${currentParent.name}-${child.name || child.href}-${index}`"
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
      </template>
      <template v-if="variant === 'page'">
        <div class="container">
          <div class="row">
            <template
              v-for="item in menu.filter(
                (item) =>
                  item.show &&
                  to(item) &&
                  !['Admin', 'Contact', 'Settings'].includes(item.title)
              )"
            >
              <template v-if="typeof item !== 'undefined' && item.children">
                <div
                  v-for="(child, index) in childrenAndGrandchildren(
                    item
                  ).filter((child) => child.show)"
                  :key="`subnav-${child.name || child.href}-${index}`"
                  :class="`col-6 col-sm-4 col-lg-3 col-xl-2
mb-1
p-1
feature-card-column
feature-card-name-${child.name}`"
                >
                  <NavItem
                    v-if="!child.children"
                    :to="last(child) || child"
                    :item="child"
                    variant="page"
                  ></NavItem>
                </div>
              </template>
            </template>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { Capacitor } from "@capacitor/core";
import { mapState } from "vuex";
import navMixin from '@/lib/mixins/nav-mixin';

export default {
  mixins: [navMixin],
  props: {
    l1: {
      type: Object,
    },
    l2: {
      type: Object,
    },
    level: {
      default: "main", // or "secondary" - which level to show
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
    autoHide: {
      type: Boolean,
      default: false,
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
    ...mapState("fullHistory", ["fullHistory"]),
    ...mapState("shows", ["categories"]),
    pro() {
      return this.forcePro || this.$store.state.subscriptions.active;
    },
    fullHistoryPathsByL1L2() {
      return this.$store.getters["fullHistory/fullHistoryPathsByL1L2"]({
        l1: this.l1,
        l2: this.l2,
      });
    },
    userIsAdmin() {
      return this.$auth.user && this.$auth.user.role == 1;
    },
    native() {
      return Capacitor.isNativePlatform();
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
