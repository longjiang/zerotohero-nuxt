<template>
  <span
    :class="{'popup-note': true, 'popup-note-disabled': !content}"
    @click="openPopup"
  >
    {{ number }}
  </span>
</template>

<script>
export default {
  props: {
    number: {
      type: Number,
    },
    content: {
      type: String,
    },
  },
  data() {
    return {
      hover: false,
    };
  },
  methods: {
    async openPopup() {
      this.$nuxt.$emit("showPopupDictionary", {
        info: this.content,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.popup-note {
  display: inline-block;
  font-size: 0.8rem;
  min-width: 1.3rem;
  height: 1.3rem;
  line-height: 1.25rem;
  overflow: hidden;
  margin-left: 0.2rem;
  margin-right: 0.2rem;
  margin-bottom: -0.2rem;
  border-radius: 0.65rem;
  border: none;
  text-align: center;
  background-color: #ccc;
  color: white;
}

.skin-dark,
.widget-dark {
  .popup-note {
    background-color: rgb(255 255 255 / 38%);
    color: black;
  }
}

.popup-note-content {
  font-size: 1rem;
  color: #666;
}

.popup-note-disabled {
  display: none;
}
</style>