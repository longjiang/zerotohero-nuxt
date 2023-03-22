<template>
  <div class="word-block-quiz">
    <span class="transparent">{{ text }}</span>
  </div>
</template>

<script>
export default {

  props: {
    popup: {
      default: true,
    },
    sticky: {
      default: false, // whether or not to show each word's level color by default (without hovering)
    },
    common: {
      default: false,
    },
    seen: {
      default: false, // whether this word has already been annotated ('seen') before
    },
    saved: {
      default: false,
    },
    obscure: {
      default: false,
    },
    definition: {
      default: undefined,
    },
    text: {
      default: ""
    },
    hanja: {
      default: undefined
    },
    phonetics: {
      default: undefined
    }
  },
}
</script>

<style scoped>
.word-block-quiz {
  border-bottom: 1px solid #ccc;
}
</style>