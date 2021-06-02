<template>
  <div class="paginator">
    <router-link
      class="paginator-previous mr-2 btn btn-small mb-1"
      :to="url(previous)"
      title="Previous word"
      v-if="previous"
    >
      <i class="fas fa-chevron-left"></i>
    </router-link>
    <b>{{ title }}</b> {{ currentIndex + 1 }} of {{ items.length }}
    <router-link
      class="paginator-next ml-2 btn btn-small mb-1"
      :to="url(next)"
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
      default: 'Item'
    },
    items: {
      type: Array
    },
    findCurrent: {
      type: Function
    },
    url: {
      type: Function
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
