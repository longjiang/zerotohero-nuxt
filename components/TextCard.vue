<template>
  <div class="text-card p-5">
    <router-link class="link-unstyled" :to="{name: 'reader', params: {method: 'shared', arg: text.id}}"><h5 class="mb-0">{{ text.title }}</h5></router-link>
  </div>
</template>

<script>
export default {
  props: {
    text: {
      type: Object // {id: 1, title: 'My Text', text: 'This is some text body...', translation: 'C\'est le corps de ce texte.' }
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