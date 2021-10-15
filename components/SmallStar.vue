<template>
  <div class="toggle-small-star d-inline-block focus-exclude">
    <button
      class="small-star remove-hit"
      v-if="saved(item)"
      @click.stop.prevent="remove(item)"
      title="Remove Hit"
    >
      <i class="fas fa-star"></i>
    </button>
    <button
      class="small-star add-hit"
      v-if="!saved(item)"
      @click.stop.prevent="save(item)"
      title="Add"
    >
      <i class="far fa-star"></i>
    </button>
  </div>
</template>

<script>
import Helper from "@/lib/helper";

export default {
  props: {
    item: false,
    saved: {
      type: Function,
    },
    save: {
      type: Function,
    },
    remove: {
      type: Function,
    },
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
.toggle-small-star {
  margin-right: 0.5rem;
}
.small-star {
  border: none;
  background: none;
  padding: 0;
  display: inline-block;
  color: #666;
  margin: 0;
}
</style>
