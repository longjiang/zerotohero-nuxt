<template>
  <div
    :class="{
      'text-card d-flex align-items-start justify-content-between': true,
      [`skin-${$skin}`]: true,
      'cursor-pointer p-4': link,
    }"
    @click="link ? $router.push(to) : null"
  >
    <h5 class="mb-0">{{ text.title }}</h5>
    <div>
      <b-button
        class="youtube-video-card-badge border-0"
        v-if="text.id"
        size="sm"
        variant="no-bg"
        style="width: 2rem"
        @click.stop="$bvModal.show('actionsModal' + text.id)"
      >
        <i class="fa-solid fa-ellipsis-v"></i>
      </b-button>

      <b-modal :id="'actionsModal' + text.id" :title="$t('Actions')" centered hide-footer size="sm">
        <b-button @click.stop="rename()" class="d-block w-100 text-left" variant="light">
          <i class="fa-solid fa-edit mr-2"></i>
          {{ $t("Rename") }}
        </b-button>
        <b-button @click.stop="remove()" class="d-block w-100 text-left" variant="light">
          <i class="fa-solid fa-trash mr-2"></i>
          {{ $t("Delete") }}
        </b-button>
      </b-modal>
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
    link: {
      type: Boolean,
      default: true,
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
      // First prompt the user to confirm deletion
      if (!confirm(this.$t("Are you sure you want to delete this text?"))) return;
      // Then dispatch the action to delete the text
      this.$store.dispatch("savedText/remove", {
        l2: this.$l2,
        itemId: this.text.id,
      });
      this.$emit("removed", this.text.id);
    },
    async rename() {
      this.$bvModal.hide("actionsModal" + this.text.id);
      let title = prompt(this.$t("Enter new title"), this.text.title);
      if (title) {
        this.$store.dispatch("savedText/update", {
          l2: this.$l2,
          payload: { id: this.text.id, title },
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.text-card {
  padding: 1rem;
  border-radius: 0.5rem;
  &.skin-light {
    border: 1px solid rgba(0, 0, 0, 0.05);
    &:hover {
      background-color: rgba(0, 0, 0, 0.03);
    }
  }
  &.skin-dark {
    border: 1px solid rgba(245, 245, 245, 0.1);
    &:hover {
      background-color: rgba(245, 245, 245, 0.03); 
    }
  }
}
</style>
