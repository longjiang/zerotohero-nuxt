<template>
  <div class="text-card p-4">
    <router-link class="link-unstyled" :to="to"><h5 class="mb-0">{{ text.title }}</h5></router-link>
    <div class="mt-3 text-right">
      <b-button
      class="youtube-video-card-badge border-0"
      v-if="text.id"
      size="sm"
      variant="light text-secondary"
      @click="remove()"
    >
      {{ $t('Delete') }}
    </b-button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    text: {
      type: Object // {id: 1, title: 'My Text', text: 'This is some text body...', translation: 'C\'est le corps de ce texte.' }
    },
    type: {
      type: String,
      default: 'remote' // or 'local
    }
  },
  computed: {
    to() {
      let to = {name: 'reader' }
      if (this.type === 'remote') to.params = {method: 'shared', arg: this.text.id}
      return to
    }
  },
  methods: {
    async remove() {
      this.$emit('removed', this.text.id)
    }
  }
}
</script>

<style>
.text-card {
  box-shadow: 0 5px 15px rgba(0,0,0,0.25);
  padding: 1rem;
  border-radius: 0.5rem;
}
</style>