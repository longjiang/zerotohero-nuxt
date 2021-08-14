<template>
  <div class="toggle-small-star d-inline-block focus-exclude">
    <button
      class="small-star remove-hit"
      v-if="saved"
      @click.stop.prevent="remove"
      title="Remove Hit"
    >
      <i class="fas fa-star"></i>
    </button>
    <button
      class="small-star add-hit"
      v-if="!saved"
      @click.stop.prevent="save"
      title="Add"
    >
      <i class="far fa-star"></i>
    </button>
  </div>
</template>

<script>
export default {
  props: {
    item: undefined,
    store: {
      type: String,
    },
  },
  data() {
    return {
      saved: false,
    };
  },
  mounted() {
    this.checkSaved();
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith(this.store)) {
        this.checkSaved();
      }
    });
  },
  beforeDestroy() {
    this.unsubscribe();
  },
  methods: {
    save() {
      this.$store.dispatch(`${this.store}/add`, Object.assign({}, this.item));
    },
    remove() {
      this.$store.dispatch(
        `${this.store}/remove`,
        Object.assign({}, this.item)
      );
    },
    checkSaved() {
      this.saved = this.$store.getters[`${this.store}/has`](
        Object.assign({}, this.item)
      );
    },
  },
};
</script>

<style scoped>
.toggle-small-star {
  margin-right: 0.5rem;
}
</style>
