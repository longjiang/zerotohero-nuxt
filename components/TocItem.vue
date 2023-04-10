<template>
  <div>
    <div
      :class="['toc-item', { 'toc-subitem': isSubitem }]"
      @click="$emit('load-chapter', item.href)"
    >
      <a class="link-unstyled">{{ item.label }}</a>
    </div>
    <div v-if="item.subitems && item.subitems.length > 0">
      <TocItem
        v-for="(subitem, index) in item.subitems"
        :key="index"
        :item="subitem"
        :isSubitem="true"
        @load-chapter="$emit('load-chapter', $event)"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: "TocItem",
  props: {
    item: {
      type: Object,
      required: true,
    },
    isSubitem: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style lang="scss" scoped>
.toc-item {
  padding: 0.5rem 1rem;
  font-size: 1.2em;
  font-weight: bold;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  &:hover {
    background-color: #eee;
  }
  a {
    text-decoration: none;
    color: #555;
  }
}

.toc-subitem {
  padding-left: 2rem;
  font-size: 0.9em;
  font-weight: normal;
}

.toc-item a:hover {
  text-decoration: underline;
}
</style>
