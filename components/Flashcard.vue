<template>
  <div
    @click="toggleReveal"
    :class="{
      flashcard: active,
      flipped,
    }"
  >
    <div class="front" v-if="active">
      <slot name="front"></slot>
    </div>
    <div class="back">
      <slot name="back"></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    active: true
  },
  data() {
    return {
      flipped: false
    }
  },
  methods: {
    toggleReveal() {
      this.flipped = !this.flipped;
    },
  }
};
</script>

<style scoped>

.flashcard {
  position: relative;
  width: 100%;
  background-color: #ffffff;
  border: 1px solid #e3e3e3;
  border-radius: 5px;
  box-shadow: 4px 6px 11px rgba(0, 0, 0, 0.2);
  margin-bottom: 1rem;
}

.flashcard .front,
.flashcard .back {
  display: flex;
  align-items: center;
  justify-content: center;
  height: auto;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
  transition: transform 0.5s;
  cursor: pointer;
}

.flashcard .front {
  transform: rotateY(0);
}

.flashcard .back {
  transform: rotateY(180deg);
  opacity: 1;
}

.flashcard.flipped .front {
  transform: rotateY(180deg);
  opacity: 0;
  position: absolute;
  top: 0;
  left: 0;
}

.flashcard.flipped .back {
  transform: rotateY(0);
  opacity: 1;
}

.flashcard:not(.flipped) .back {
  opacity: 0;
  position: absolute;
  top: 0;
  left: 0;
}
</style>