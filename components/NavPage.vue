<template>
  <container-query :query="query" v-model="params">
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
              )
                .filter((item) => item.show && !item.children)
                .slice(0, limit ? limit : 10000)"
              :key="`subnav-${item.name || item.href}-${index}`"
              :class="`${
                params.xs
                  ? 'col-12'
                  : params.sm
                  ? 'col-6'
                  : params.md
                  ? 'col-4'
                  : params.lg
                  ? 'col-3'
                  : 'col-2'
              } p-1
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
  </container-query>
</template>

<script>
import navMixin from "@/lib/mixins/nav-mixin";
import { ContainerQuery } from "vue-container-query";

export default {
  components: {
    ContainerQuery,
  },
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
      params: {},
      query: {
        xs: {
          minWidth: 0,
          maxWidth: 423,
        },
        sm: {
          minWidth: 423,
          maxWidth: 720,
        },
        md: {
          minWidth: 720,
          maxWidth: 960,
        },
        lg: {
          minWidth: 960,
          maxWidth: 1140,
        },
        xl: {
          minWidth: 1140,
        },
      },
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
