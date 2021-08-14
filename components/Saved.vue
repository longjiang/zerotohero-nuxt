<template>
  <div class="btn-saved-wrapper d-inline-block focus-exclude">
    <button
      class="btn-saved btn-saved-saved"
      v-if="saved"
      @click.stop.prevent="remove"
      title="Remove"
    >
      <i :class="`fas fa-${icon}`"></i>
    </button>
    <button
      class="btn-saved btn-saved-not-saved add-hit"
      v-if="!saved"
      @click.stop.prevent="save"
      title="Add"
    >
      <i :class="`far fa-${icon}`"></i>
    </button>
  </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Object
    },
    store: {
      type: String,
    },
    icon: {
      default: 'star'
    }
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
.btn-saved {
  display: inline-block;
  position: relative;
  padding: 0;
  margin: 0;
  background: none;
  border: none;
  color: #ffe597;
}

.btn-saved-saved {
  background: none;
  border: none;
  color: #f8b61e;
  padding: 0;
  font-size: 1em;
}
</style>

