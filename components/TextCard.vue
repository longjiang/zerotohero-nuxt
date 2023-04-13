<template>
  <div
    :class="{
      'text-card p-4 cursor-pointer': true,
      [`skin-${$skin}`]: true,
    }"
    @click="$router.push(to)"
  >
    <h5 class="mb-0">{{ text.title }}</h5>
    <div class="mt-3 text-right">
      <b-button
        class="youtube-video-card-badge border-0"
        v-if="text.id"
        size="sm"
        :variant="$skin"
        @click="remove()"
      >
        {{ $t("Delete") }}
      </b-button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    text: {
      type: Object, // {id: 1, title: 'My Text', text: 'This is some text body...', translation: 'C\'est le corps de ce texte.' }
    },
    type: {
      type: String,
      default: "remote", // or 'local
    },
  },
  computed: {
    to() {
      let to = { name: "reader" };
      if (this.type === "remote")
        to.params = { method: "shared", arg: this.text.id };
      return to;
    },
  },
  methods: {
    async remove() {
      this.$emit("removed", this.text.id);
    },
  },
};
</script>

<style lang="scss" scoped>
.text-card {
  padding: 1rem;
  border-radius: 0.5rem;
  &.skin-light {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(0, 0, 0, 0.1);
    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
  }
  &.skin-dark {
    box-shadow: 0 5px 15px rgba(245, 245, 245, 0.25);
    border: 1px solid rgba(245, 245, 245, 0.25);
    &:hover {
      background-color: rgba(245, 245, 245, 0.1); 
    }
  }
}
</style>
