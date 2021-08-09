<template>
  <div class="paginator">
    <router-link
      class="paginator-previous mr-2 btn btn-small mb-1"
      :to="url(previous, currentIndex - 1)"
      title="Previous word"
      v-if="previous"
    >
      <i class="fas fa-chevron-left"></i>
    </router-link>
    <b><router-link class="link-unstyled" v-if="home && title" :to="home">{{ title }}</router-link ><span :to="home" v-else>{{ title }}</span ></b> {{ currentIndex + 1 }} of {{ items.length }}
    <router-link
      class="paginator-next ml-2 btn btn-small mb-1"
      :to="url(next, currentIndex + 1)"
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
      default: undefined
    },
    items: {
      type: Array
    },
    findCurrent: {
      type: Function
    },
    url: {
      type: Function
    },
    home: {
      type: String
    }
  },
  computed: {
    currentIndex() {
      return this.items.findIndex(this.findCurrent)
    },
    previous() {
      if (this.currentIndex - 1 >= 0) {
        return this.items[this.currentIndex - 1]
      } else {
        return false
      }
    },
    next() {
      if (this.currentIndex + 1 < this.items.length) {
        return this.items[this.currentIndex + 1]
      } else {
        return false
      }
    }
  },
  mounted() {}
}
</script>

<style></style>
