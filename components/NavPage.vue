<template>
  <div
    :class="{
      [`zth-nav-${$skin}`]: true,
      'zth-nav-page': true,
    }"
  >
    <div class="nav-page">
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
    skin: {
      default: null, // this overrides user's settings
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
@import "./Nav/index.scss";
</style>
