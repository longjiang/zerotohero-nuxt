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
          <div
            v-for="(item, index) in flattenList(
              menu.filter(
                (item) =>
                  item.show &&
                  to(item) &&
                  !['Admin', 'Contact', 'Settings'].includes(item.title)
              )
            ).filter((item) => item.show && !item.children).slice(0, limit ? limit : 10000)"
            :key="`subnav-${item.name || item.href}-${index}`"
            :class="`col-6 col-sm-4 col-lg-3 col-xl-2
p-1
feature-card-column
feature-card-name-${item.name}`"
          >
            <NavItem
              :to="last(item) || item"
              :item="item"
              variant="page"
            ></NavItem>
          </div>
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
    showOnlyChildren: {
      type: Array,
    },
    limit: {
      type: Number,
      default: 0,
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

.feature-card-column:hover {
  z-index: 1;
}
</style>
