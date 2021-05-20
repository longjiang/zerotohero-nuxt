<template>
  <button
    v-if="visible()"
    class="show-more btn-medium btn-gray focus-exclude"
    :class="{ collapsed: collapsed }"
    v-on:click="showMoreClick"
  >
    <span v-if="collapsed">
      <slot>{{ $t('Show {count} More', {count: count()}) }}</slot>
    </span>
    <span v-else>Collapse</span>
  </button>
</template>

<script>
export default {
  props: {
    length: {
      default: false
    },
    min: {
      default: false
    }
  },
  data() {
    return {
      collapsed: true
    }
  },
  methods: {
    showMoreClick(e) {
      this.collapsed = !this.collapsed
      var $button = $(e.currentTarget)
      $button.siblings('[data-collapse-target]').toggleClass('collapsed')
      $button.toggleClass('collapsed')
    },
    count() {
      if (this.length) {
        return this.length - this.min
      } else {
        return ''
      }
    },
    visible() {
      if (!this.length) {
        return false
      } else if (this.min < this.length) {
        return true
      } else {
        return false
      }
    }
  }
}
</script>
