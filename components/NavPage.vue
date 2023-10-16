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
              v-for="(item, index) in filteredItems"
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
                :skin="skin"
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
  },
  data() {
    return {
      params: {},
      query: {
        xs: {
          minWidth: 0,
          maxWidth: 320,
        },
        sm: {
          minWidth: 320,
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
  computed: {
    filteredItems() {
      let topLevelItems = this.menu.filter((item) => {
        const isNotHidden = item.show !== false;
        const isRouteResolvable = this.to(item) !== undefined;
        return isNotHidden && isRouteResolvable;
      });

      let terminalItems = this.flattenList(topLevelItems);

      let filteredTerminalItems = terminalItems.filter((item) => {
        const isTerminal = !item.children;
        return item.show && isTerminal;
      });
      
      if (this.showOnly) {
        let showOnlyItems = []
        for (let title of this.showOnly) {
          const foundItem = filteredTerminalItems.find(item => item.title === title)
          if (foundItem) showOnlyItems.push(foundItem) // This way we preserve the order of the showOnly array
          else {
            console.error(`Could not find item with title "${title}" in menu`)
          }
        }
        return showOnlyItems;
      }

      return filteredTerminalItems;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/variables.scss";

.feature-card-column:hover {
  z-index: 1;
}
</style>
