<template><span>{{ token.text }}</span></template>
<script>
export default {
  props: {
    token: {
      type: Object,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  }
}
</script>
