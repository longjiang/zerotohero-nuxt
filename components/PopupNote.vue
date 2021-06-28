<template>
  <v-popover
    :open="hover"
    :open-group="'id' + _uid"
    placement="top"
    trigger="manual"
    class="popup-note-popover"
    style="display: inline-block"
  >
    <span
      class="popup-note"
      @mouseover="mouseOverHandler"
      @mouseout="mouseOutHandler"
    >
      {{ number }}
    </span>
    <template slot="popover">
      <button class="word-block-tool-tip-close" @click="hover = false">
        <i class="fa fa-times"></i>
      </button>
      <div class="popup-note-content mt-4">{{ content }}</div>
    </template>
  </v-popover>
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
    mouseOverHandler() {
      this.openPopup();
    },
    mouseOutHandler() {
      this.closePopup();
    },
    async openPopup() {
      setTimeout(() => {
        if ($(".popover:hover").length === 0) {
          this.hover = true;
        }
      }, 300); // Allow user to interact with previous popover
    },
    closePopup() {
      setTimeout(() => {
        // Allow user to interact with popover
        let $popovers = $(".popover:hover");
        if ($popovers && $popovers.length === 0) {
          this.hover = false;
        }
      }, 300);
    },
  },
};
</script>

<style>
.popup-note {
  display: inline-block;
  font-size: 0.8rem;
  min-width: 1.3rem;
  height: 1.3rem;
  line-height: 1.2rem;
  overflow: hidden;
  margin-left: 0.2rem;
  margin-right: 0.2rem;
  margin-bottom: -0.2rem;
  border-radius: 0.65rem;
  border: 1px solid #ccc;
  text-align: center;
  background-color: #ccc;
  color: white;
}

.popup-note-content {
  font-size: 1rem;
  color: #666;
}
</style>