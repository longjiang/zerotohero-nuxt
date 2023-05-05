<!-- FilterDropdown.vue -->
<template>
  <span>
    <span @click="showModal" class="filter-dropdown mr-2">
      {{ getDisplayText }}
      <i class="fa-solid fa-caret-down"></i>
    </span>
    <b-modal
      :ref="`${type}Modal`"
      size="lg"
      centered
      hide-footer
      modal-class="safe-padding-top mt-4"
      body-class="dropdown-menu-modal-wrapper"
      :title="$t(title)"
    >
      <div class="row">
        <div
          v-for="(item, index) in items"
          :key="`dropdown-menu-item-${type}-${index}`"
          class="mb-1 col-6 col-lg-4"
        >
          <span @click="emitFilter(item.value)" class="cursor-pointer">
            {{ $t(item.text) }}
            <span v-if="item.count" class="item-count">
              ({{ item.count }})
            </span>
          </span>
        </div>
      </div>
    </b-modal>
  </span>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      default: () => [],
    },
    selectedItem: [String, Number],
    type: String,
    title: String,
    defaultText: String,
  },
  computed: {
    getDisplayText() {
      const selectedItem = this.items.find(
        (item) => item.value === this.selectedItem
      );
      return this.$t(selectedItem ? selectedItem.text : this.defaultText);
    },
  },
  methods: {
    showModal() {
      this.$refs[`${this.type}Modal`].show();
    },
    emitFilter(value) {
      this.$emit("filter", value);
      this.$refs[`${this.type}Modal`].hide();
    },
  },
};
</script>

<style scoped>
.filter-dropdown {
  cursor: pointer;
}

.item-count {
  font-size: 0.8rem;
  color: #888;
  font-weight: bold;
}
</style>
