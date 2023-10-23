<template><span @click="showPopup" class="word-block">{{ token.text }}</span></template>
<script>
export default {
  props: {
    token: {
      type: Object,
      required: true,
    },
  },
  methods: {
    showPopup() {
      this.$nuxt.$emit("showPopupDictionary", this.token, this.text);
    },
  }
}
</script>
