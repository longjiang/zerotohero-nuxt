<template>
  <div class="text-card">
    <router-link :to="{name: 'reader', params: {method: 'shared', arg: text.id}}"><h5>{{ text.title }}</h5></router-link>
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

</style>