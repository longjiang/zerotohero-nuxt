<template>
  <div class="paginator">
    <router-link
      class="paginator-previous mr-2 btn btn-small mb-1"
      :to="{ path: previousPath, query: $route.query }"
      title="Previous word"
      v-if="previous"
    >
      <i class="fas fa-chevron-left"></i>
    </router-link>
    <b>
      <component
        :is="home ? 'router-link' : 'span'"
        class="link-unstyled"
        v-if="title"
        :to="home"
      >
        {{ title }}
      </component>
    </b>
    <component
      :is="home ? 'router-link' : 'span'"
      class="link-unstyled"
      v-if="home"
      :to="home"
    >
      {{ currentIndex + 1 }} / {{ items.length }}
    </component>
    <b>
      <component
        :is="home ? 'router-link' : 'span'"
        class="link-unstyled"
        v-if="append"
        :to="home"
      >
        {{ append }}
      </component>
    </b>
    <router-link
      class="paginator-next ml-2 btn btn-small mb-1"
      :to="{ path: nextPath, query: $route.query }"
      title="Next word"
      v-if="next"
    >
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
  mounted() {},
};
</script>

<style></style>
