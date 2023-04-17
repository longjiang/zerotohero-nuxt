<template>
  <div
    @click="toggleReveal"
    :class="{
      flashcard: active,
      [`skin-${$skin}`]: true,
      flipped,
    }"
  >
    <div class="front" v-if="active">
      <slot name="front"></slot>
      <span class="flip-prompt"><i class="fa-solid fa-rotate"></i> {{ 'Flip Flashcard' }}</span>
    </div>
    <div class="back">
      <slot name="back"></slot>
      <span class="flip-prompt invisible"><i class="fa-solid fa-rotate"></i> {{ 'Flip Flashcard' }}</span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    active: {
      default: true,
    },
  },
  data() {
    return {
      flipped: false,
    };
  },
  methods: {
    toggleReveal() {
      this.flipped = !this.flipped;
    },
  },
};
</script>

<style lang="scss" scoped>
.flashcard {
  &.skin-light {
    filter: drop-shadow(2px 2px 5px rgba(0, 0, 0, 0.33));
    .front,
    .back {
      background-color: #ffffff;
      border: 1px solid #dddddd;
    }
    .flip-prompt {
      color: #ddd;
    }
  }
  &.skin-dark {
    filter: drop-shadow(2px 2px 5px rgba(0, 0, 0, 0.33));
    .front,
    .back {
      background-color: #222;
      border: 1px solid #444;
    }
    .flip-prompt {
      color: #777;
    }
  }
}
.flashcard {
  position: relative;
  width: 100%;
  margin-bottom: 1rem;
  .flip-prompt {
    width: 100%;
    margin-top: 0.5rem;
  }
}

.flashcard .front,
.flashcard .back {
  border-radius: 5px;
  /* box-shadow: 4px 6px 11px rgba(0, 0, 0, 0.2); */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
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
