<template>
  <div class="paginator">
    <router-link :class="`paginator-previous mr-2 btn btn-xs btn-${$skin} mb-1`" title="Previous (P)"
      :to="{ path: previousPath, query: $route.query }" :title="$t('Previous') + ' (P)'" v-if="previous">
      <i class="fas fa-chevron-left"></i>
    </router-link>
    <b>
      <component :is="home ? 'router-link' : 'span'" class="link-unstyled" v-if="title" :to="home">
        {{ title }}
      </component>
    </b>
    <component :is="home ? 'router-link' : 'span'" class="link-unstyled" v-if="home" :to="home">
      {{ currentIndex + 1 }} / {{ items.length }}
    </component>
    <b>
      <component :is="home ? 'router-link' : 'span'" class="link-unstyled" v-if="append" :to="home">
        {{ append }}
      </component>
    </b>
    <router-link :class="`paginator-previous ml-2 btn btn-xs btn-${$skin} mb-1`"
      :to="{ path: nextPath, query: $route.query }" :title="$t('Next') + ' (N)'" v-if="next">
      <i class="fas fa-chevron-right"></i>
    </router-link>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      default: undefined,
    },
    items: {
      type: Array,
    },
    findCurrent: {
      type: Function,
    },
    url: {
      type: Function,
    },
    home: {
      type: [String, Object],
    },
    append: {
      type: String,
    },
  },
  computed: {
    currentIndex() {
      return this.items.findIndex(this.findCurrent);
    },
    previous() {
      if (this.currentIndex - 1 >= 0) {
        return this.items[this.currentIndex - 1];
      } else {
        return false;
      }
    },
    next() {
      if (this.currentIndex + 1 < this.items.length) {
        return this.items[this.currentIndex + 1];
      } else {
        return false;
      }
    },
    previousPath() {
      return this.url(this.previous, this.currentIndex - 1);
    },
    nextPath() {
      return this.url(this.next, this.currentIndex + 1);
    },
  },
  mounted() {
    this.bindKeys();
  },
  beforeDestroy() {
    this.unbindKeys();
  },
  methods: {
    bindKeys() {
      window.addEventListener("keydown", this.handleKeydown);
    },
    unbindKeys() {
      window.removeEventListener("keydown", this.handleKeydown);
    },
    handleKeydown(e) {
      if (
        !["INPUT", "TEXTAREA"].includes(e.target.tagName.toUpperCase()) &&
        !e.metaKey
      ) {
        if (e.code == "KeyN") {
          this.$router.push({ path: this.previousPath, query: this.$route.query });
          e.preventDefault();
          return false;
        }
        if (e.code == "KeyP") {
          this.$router.push({ path: this.nextPath, query: this.$route.query });
          e.preventDefault();
          return false;
        }
      }
    }
  }
};
</script>

<style></style>
